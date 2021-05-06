---
title: "Do I need an interface with Spring boot?"
date: "2021-04-27"
featuredImage: "../../images/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot"]
excerpt: "In this blog post, we discover whether we have to use an interface when writing services with Spring boot."
---

# Do I need an interface with Spring boot?

When working with Spring boot, you often use a service (a bean annotated with `@Service`). 
In many examples on the internet, you'll see that people create an interface for those services. µ
For example, if we're creating a todo list application you might create a `TodoService` interface with a `TodoServiceImpl` implementation.

In this blog post, we'll see why we often do that, and whether it's necessary.

### The short answer

The short answer is pretty simple. **No**, you don't need an interface. 
If you create a service, you could name the class itself `TodoService` and autowire that within your beans. For example:

```java
@Service
public class TodoService {
    public List<Todo> findAllTodos() {
        // TODO: Implement
        return new ArrayList<>();
    }
}

@Component
public class TodoFacade {
    private TodoService service;
    
    public TodoFacade(TodoService service) {
        this.service = service;
    }
}
```

The example you see here **will work**, regardless of whether you use field injection with `@Autowired` or constructor injection.

### Then why bother?

So, if we don't need it... then why do we often write one? Well, the first reason is a rather historical one. 
But before we take a look at that, we have to explain how annotations work with Spring.

If you use annotations like `@Cacheable`, you expect that a result from the cache is returned. 
The way Spring does that is by creating a proxy for your beans and adding the necessary logic to those proxies. 
Originally, Spring used JDK dynamic proxies. These dynamic proxies can only be generated for interfaces, which is why you had to write an interface back in the day.

However, since more than a decade ago, Spring also supported CGLIB proxying. These proxies do not require a separate interface. Since Spring 3.2, you don't even have to add a separate library, as CGLIB is included with Spring itself.

### Loose coupling

A second reason might be to create loose coupling between two classes. By using an interface, the class that depends on your service no longer relies on its implementation. This allows you to use them independently. For example:

```java
public interface TodoService {
    List<Todo> findAllTodos();
}

@Service
public class TodoServiceImpl {
    public List<Todo> findAllTodos() {
        // TODO: Implement
        return new ArrayList<>();
    }
}

@Component
public class TodoFacade {
    private TodoService service;
    
    public TodoFacade(TodoService service) {
        this.service = service;
    }
}
```

However, in this example, I think `TodoFacade` and `TodoServiceImpl` belong together. 
Adding an interface here would create additional complexity. 
Personally, I don't think it's worth it.

## Multiple implementations

One reason where loose coupling could be useful is if you have multiple implementations. For example, let's say you have two implementations of a `TodoService`, one of them retrieves the todo list from memory, the other one retrieves it from a database somewhere.

```java
public interface TodoService {
    List<Todo> findAllTodos();
}

@Service
public class InMemoryTodoServiceImpl implements TodoService {
    public List<Todo> findAllTodos() {
        // TODO: Implement
        return new ArrayList<>();
    }
}

@Service
public class DatabaseTodoServiceImpl implements TodoService {
    public List<Todo> findAllTodos() {
        // TODO: Implement
        return new ArrayList<>();
    }
}

@Component
public class TodoFacade {
    private TodoService service;
    
    public TodoFacade(TodoService service) {
        this.service = service;
    }
}
```



In this case, loose coupling is very useful, as your `TodoFacade`doesn't need to know whether your todos are stored within a database or within memory. 
That's not the responsibility of the facade, but the application configuration.

The way you'd make this work depends on what you're trying to achieve. If your `TodoFacade` has to call all implementations, then you should inject a collection:

```java
@Component
public class TodoFacade {
    private List<TodoService> services;
    
    public TodoFacade(TodoService services) {
        this.services = services;
    }
}
```

If one of the implementations should be used in 99% of the cases, and the other in only a very specific case, then use `@Primary`:

```java
@Primary
@Service
public class DatabaseTodoServiceImpl implements TodoService {
    public List<Todo> findAllTodos() {
        // TODO: Implement
        return new ArrayList<>();
    }
}
```

Using `@Primary`,  you tell the Spring container that it will use this implementation whenever it has to inject a `TodoService`.
If you have to use the other one, you have to explicitly configure it by using `@Qualifier` or by injecting the specific implementation itself. Personally, I would do this within a separate `@Configuration` class, because otherwise, you're polluting your `TodoFacade` again with implementation-specific details.

For example:

```java
@Configuration
public class TodoConfiguration {
    @Bean
    // Using @Qualifier
    public TodoFacade todoFacade(@Qualifier("inMemoryTodoService") TodoService service) {
        return new TodoFacade(service);
    }
    
    @Bean
    // Or by using the specific implementation
    public TodoFacade todoFacade(InMemoryTodoService service) {
        return new TodoFacade(service);
    }
}
```

### Inversion of control

Another type of loose coupling is inversion of control or IoC. To me, inversion of control is useful when working with multiple modules that depend on each other. For example, let's say we have an `OrderService`  and a `CustomerService`. A customer should be able to delete its profile, and in that case, all pending orders should be canceled. If we implement that without interfaces, we get something like this:

```java
@Service
public class OrderService {
    public void cancelOrdersForCustomer(ID customerId) {
        // TODO: implement
    }
}

@Service
public class CustomerService {
    private OrderService orderService;
    
    public CustomerService(OrderService orderService) {
        this.orderService = orderService;
    }
    
    public void deleteCustomer(ID customerId) {
        orderService.cancelOrdersForCustomer(customerId);
        // TODO: implement
    }
}
```

If we do this, things can go bad really fast. All domains within your application will be tied together, and eventually, you'll end up with a highly coupled application.

In stead of doing this, we could create a `CustomerDeletionListener` interface:

```java
public interface CustomerDeletionListener {
    void onDeleteCustomer(ID customerId);
}

@Service
public class CustomerService {
    private List<CustomerDeletionListener> deletionListeners;
    
    public CustomerService(List<CustomerDeletionListener> deletionListeners) {
        this.deletionListeners = deletionListeners;
    }
    
    public void deleteCustomer(ID customerId) {
        deletionListeners.forEach(listener -> listener.onDeleteCustomer(customerId));
        // TODO: implement
    }
}

@Service
public class OrderService {
    public void cancelOrdersForCustomer(ID customerId) {
        // TODO: implement
    }
}

@Component
public class OrderCustomerDeletionListener implements CustomerDeletionListener {
    private OrderService orderService;
    
    public OrderCustomerDeletionListener(OrderService orderService) {
        this.orderService = orderService;
    }
    
    @Override
    public void onDeleteCustomer(ID customerId) {
        orderService.cancelOrdersForCustomer(customerId);
    }
}
```

If you look at this example, you'll see the inversion of control in action. 
In the first example, if we change the `cancelOrdersForCustomer()` method within `OrderService`, then `CustomerService` has to change as well. This means that the `OrderService` is in control.

In the second example, the `OrderService` is no longer in control. When we change the `cancelOrdersForCustomer()`module, only the `OrderCustomerDeletionListener` has to change, which is part of the order module. 
This means that the `CustomerService` is in control. Also, both services are loosely coupled, as one does not directly depend on the other.

While the second approach does introduce more complexity (one new class and one new interface), it does make it so that neither domain is highly coupled to the other. That makes them easier to refactor. 
This listener can be refactored to a more event-driven architecture as well. That makes it easier to refactor into a domain-driven modular design or a microservice architecture.

### Testing

One final thing I want to talk about is testing. Some people will argue that you need an interface so that you can have a dummy implementation (and thus, have multiple implementations). However, mocking libraries like Mockito solve this problem.

If you're writing a unit test, you could use the `MockitoExtension`:

```java
@ExtendWith(MockitoExtension.class)
public class TodoFacadeTest {
    private TodoFacade facade;
    @Mock
    private TodoService service;
    
    @BeforeEach
    void setUp() {
        this.facade = new TodoFacade(service);
    }
    
    // TODO: implement tests
}
```

This approach allows you to properly test the facade without actually knowing what the service does. By using `Mockito.when()` you can control what the service mock should return, and by using `Mockito.verify()` you can verify whether a specific method was called. For example:

```java
@Test
void findAll_shouldUseServicefindAllTodos() {
    Todo todo = new Todo();
    when(service.findAllTodos()).thenReturn(todo);
    assertThat(facade.findAll()).containsOnly(todo);
    verify(service).findAllTodos();
}
```

Even if you're writing integration tests that require you to run the Spring container, then you can use the `@MockBean` annotation to mock a bean. Make sure you don't scan the package that contains the actual implementation.

```java
@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = TodoFacade.class)
public class TodoFacadeTest {
    @Autowired
    private TodoFacade facade;
    @MockBean
    private TodoService service;
}
```

So in most cases, you don't need an interface when testing.

### Conclusion

So, if you ask me whether you should use an interface for your services, my answer would be no. The only exception is if you're either trying to use inversion of control, or you have multiple implementations to take care of.

You might think, wouldn't it be better to create an interface, just in case? I would say no to that as well. 
First of all, I believe in the "You aren't going to need it" (YAGNI) principle. This means that you shouldn't add additional complexity to your code for the sake of "I might need it", because usually, you don't.
Secondly, even if it turns out that you do need it, there's no problem. Most IDEs allow you to extract an interface from an existing class, and it will refactor all code to use that interface in the blink of an eye.
