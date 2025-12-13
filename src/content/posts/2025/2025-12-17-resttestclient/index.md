---
title: "Using Spring Boot's new RestTestClient"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: ""
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

When `WebClient` was added to the Spring framework, the Spring team also included a `WebTestClient`.
`WebTestClient` is a testing utility class that works on top of `WebClient` to make it easy to test your API's (eg. Spring controllers).

With the release of Spring framework 7 and Spring Boot 4, the same can now also be said for `RestClient`.
In this blogpost I'll show the possibilities with the new `RestTestClient`.

## Set up

If you want to test your Spring controllers with the new `RestTestClient`, you first need to make sure you import the proper module.
With Spring's new modular architecture, this can be found within **spring-boot-starter-webmvc-test**:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webmvc-test</artifactId>
    <scope>test</scope>
</dependency>
```

In addition, imagine a `TeskController` with the following endpoint for creating a task:

```java
@RestController
@RequestMapping("/api/task")
public class TaskController {
    private final TaskService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskDTO createTask(@AuthenticationPrincipal CustomUserDetails user, @RequestBody CreateTaskDTO request) {
        var result = service.create(user.userId(), request.description(), request.dueAt());
        return TaskDTO.of(result);
    }
}
```

> **Note**: The way that `TaskService` works is not relevant for this blogpost.
> Just keep in mind that it just contains some simple CRUD-operations.

This method will accept a `CreateTaskDTO` request body, which has a `description` and `dueAt` field.
Since tasks will be user-bound, I'm also injecting Spring Security's `UserDetails` into my controller, or at least my own implementation called `CustomUserDetails`.
This class looks pretty basic, but simply has a `UserId` next to the username + password:

```java
public record CustomUserDetails(UserId userId, String username, String password) implements UserDetails {
    // TODO: implement getters
}
```

> **Note**: The way that this `CustomUserDetails` works is not relevant for the rest of this blogpost.
> Just know that I'm using it to obtain the currently authenticated user their ID.

Then to persist the task, I wrote some logic that uses a random UUID as its ID, and I initially set the `completed` flag of a task to `false`.
For that purpose, I'm using the following DDL:

```sql
create table task (
    id uuid not null,
    user_id uuid not null,
    description varchar(255) not null,
    completed boolean not null,
    due_at timestamp,
    constraint pk_task_id primary key (id),
    constraint fk_task_user_id foreign key (user_id) references "user"(id)
);

```

## Testing modes

The nice thing about `RestTestClient` is that you can write both unit tests, integration tests and end-to-end tests without having to change how you call your API within your test.
The way this works is that `RestTestClient` can be bound to four types of context:

1. You can **bind** it to a **controller**, which would allow you to write **unit tests**
2. You can **bind** it to `MockMvc`, which allows you to write **unit tests including validation and security**.
3. You can **bind** it to a `WebApplicationContext`, which allows you to write **integration tests**.
4. You can **bind** it to a running server, which allows you to write **end-to-end tests**.

In this blogpost I'll cover all four binding modes.

## Binding `RestTestClient` to a controller

To bind `RestTestClient` to a controller, you need to pass it an instance of your controller:

```java
class TaskControllerTest {
    private RestTestClient client;

    @BeforeEach
    void setUp() {
        client = RestTestClient
            .bindToController(new TaskController()) // Bind to a controller
            .baseUrl("/api/task")
            .build();
    }
}
```

In this mode, you are responsible for creating the controller instance as the Spring container is not set up during these tests.
This also means that if your controller has any dependencies, you need to mock and inject them by yourself.
For example, using Mockito that would be:

```java
@ExtendWith(MockitoExtension.class)
class TaskControllerTest {
    private RestTestClient client;
    @InjectMocks
    private TaskController controller;
    @Mock
    private TaskService service;

    @BeforeEach
    void setUp() {
        client = RestTestClient
            .bindToController(controller)
            .baseUrl("/api/task")
            .build();
    }
}
```

So, as there is no context, this means that you can only test the basic implementation of your controller.
You cannot test anything security-related, nor can you test things like bean validations within your DTOs.

So for example, you could now write a test like this to see whether the `TaskService.create()` was correctly invoked:

```java
@Test
void createTask() {
    var body = """
    {
        "description": "test description",
        "dueAt": "2026-01-01T00:00:00Z"
    }
    """;
    var result = new Task(
        UserId.nextId(),
        "test description",
        Instant.parse("2026-01-01T00:00:00Z")
    );
    when(service.create(any(), anyString(), any())).thenReturn(result);
    client
        .post()
        .contentType(MediaType.APPLICATION_JSON)
        .body(body)
        .exchange()
        .expectStatus().isCreated()
        .expectBody()
        .jsonPath("$.id").isNotEmpty()
        .jsonPath("$.description").isEqualTo("test description")
        .jsonPath("$.dueAt").isEqualTo("2026-01-01T00:00:00Z")
        .jsonPath("$.completed").isEqualTo(false);
    verify(taskService).create(
        null,
        "test description",
        Instant.parse("2026-01-01T00:00:00Z")
    );
}
```

In this test I'm doing two things:

1. I'm calling the API and verifying that the response matches the values within the `result` object.
2. I'm checking whether the parameters passed to `TaskService` match the request body.

What's important to notice is that since there's no Spring Security involved, the `@AuthenticationPrincipal` field will be an empty object with all fields initialized to `null`.
This is the reason why I'm verifying that the first argument of `TaskService.create()` is `null`.

If you don't like this behavior, you could write your own `HandlerMethodArgumentResolver` to override what object is injected for `@AuthenticationPrincipal`.
For example:

```java
public class CustomUserDetailsAuthenticationPrincipalResolver implements HandlerMethodArgumentResolver {
    private final CustomUserDetails customUserDetails;

    public CustomUserDetailsAuthenticationPrincipalResolver(CustomUserDetails customUserDetails) {
        this.customUserDetails = customUserDetails;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterType().isAssignableFrom(CustomUserDetails.class);
    }

    @Override
    public CustomUserDetails resolveArgument(MethodParameter parameter, @Nullable ModelAndViewContainer mavContainer, NativeWebRequest webRequest, @Nullable WebDataBinderFactory binderFactory) {
        return customUserDetails;
    }
}
```

To register it, you need to change the setup of `RestTestClient` a bit.
First, let's create a field containing the user we want to "authenticate" as:

```java
private static final CustomUserDetails USER = new CustomUserDetails(
    UserId.nextId(), 
    "user1",
    // This is a BCrypt hash for 'password1'
    // This hash doesn't really matter because it's not actually used
    "{bcrypt}$2a$12$3reNTTIFP4ho5SLimvGoJeSJkoKAVSo2nJb.cUhrxHf4nArAbJu46"
);
```

After that, use the `configureServer()` method to register the argument resolver:

```java
client = RestTestClient
    .bindToController(controller)
    .baseUrl("/api/task")
    // Add this
    .configureServer(builder -> builder
        .setCustomArgumentResolvers(new CustomUserDetailsAuthenticationPrincipalResolver(user)))
    .build();
```

Now you know that the ID passed to `TaskService.create()` will be `USER.id()`.

## Binding `RestTestClient` to  `MockMvc`

The next way to test with `RestTestClient` is by binding it to `MockMvc`.
To do this, we need to set up `MockMvc`.
The easiest way of doing so is by using `@WebMvcTest`:

```java
@WebMvcTest(TaskController.class)
public class TaskControllerMockMvcTest {
    @Autowired
    private MockMvc mockMvc;
    private RestTestClient client;

    @BeforeEach
    void setUp() {
        client = RestTestClient
            .bindTo(mockMvc)
            .baseUrl("/api/task")
            .build();
    }
}
```

Now that we're using the Spring container, we can do things a bit differently.
First of all, to inject mocks we now need to use Spring's wrapper for Mockito, for example:

```java
@WebMvcTest(TaskController.class)
public class TaskControllerMockMvcTest {
    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private TaskService service;
    private RestTestClient client;
    
    // ...
```

Also, since we're using `MockMvc` we can also test both bean validations and security-related code.
To do this, I'm also going to import my security configuration and mock my `CustomUserDetailsService`:

```java
@WebMvcTest(TaskController.class)
@Import(SecurityConfiguration.class)
public class TaskControllerMockMvcTest {
    // ...
    @MockitoBean
    private CustomUserDetailsService userDetailsService;
    // ...
}
```

Now, we can write a similar test like before:

```java
@Test
void createTask() {
    var body = """
    {
        "description": "test description",
        "dueAt": "2026-01-01T00:00:00Z"
    }
    """;
    var result = new Task(
        USER.getId(),
        "test description",
        Instant.parse("2026-01-01T00:00:00Z")
    );
    when(taskService.create(any(), anyString(), any())).thenReturn(result);
    // This is the same `USER` as in our other test
    when(userDetailsService.loadByUsername("user1")).thenReturn(USER);
    client
        .post()
        .contentType(MediaType.APPLICATION_JSON)
        // Now we can use authentication!
        .headers(headers -> headers.setBasicAuth("user1", "password1"))
        .body(body)
        .exchange()
        .expectStatus().isCreated()
        .expectBody()
        .jsonPath("$.id").isNotEmpty()
        .jsonPath("$.description").isEqualTo("test description")
        .jsonPath("$.dueAt").isEqualTo("2026-01-01T00:00:00Z")
        .jsonPath("$.completed").isEqualTo(false);
    verify(taskService).create(
        USER.getId(),
        "test description",
        Instant.parse("2026-01-01T00:00:00Z")
    );
}
```

The major difference is that we no longer need to use any workaround for our `@AuthenticationPrincipal` since we're now capable of authenticating.
This is why I'm setting basic authentication headers in my test.
For the `CustomUserDetailsServie.loadByUsername()` method I'm using the same `USER` field as before.
Now the hash is important though as Spring Security will actually match it against the given password.

> **IMPORTANT**: If you test with `MockMvc`, then **no actual requests are being sent**. The "HTTP layer" is completely mocked!

## Binding `RestTestClient` to `WebApplicationContext`

The third way to test with `RestTestClient` is to bind it to your Spring's application context.
This means that you no longer have to rely on a partial slice of your application, but on the entire Spring context.
The easiest way to obtain this application context is by testing with `@SpringBootTest`:

```java
@SpringBootTest
public class TaskControllerContextTest {
    private RestTestClient client;
    @Autowired
    private WebApplicationContext context;

    @BeforeEach
    void setUp() {
        client = RestTestClient
            .bindToApplicationContext(context)
            .baseUrl("/api/task")
            .build();
    }
}
```

Now that we're running tests against the actual Spring context, we have to do things a bit different again.
The first thing we need to realize is that we're now fully constructing all beans, so no more mocks.
This means that we also need to work against a real database.
The easiest way of setting up a database is by using **Testcontainers**.

For example, in my project I have the following configuration:

```java
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

	@Bean
	@ServiceConnection
	PostgreSQLContainer postgresContainer() {
		return new PostgreSQLContainer(DockerImageName.parse("postgres:latest"));
	}

}
```

And to import it, I'm using the `@Import` annotation again:

```java
@SpringBootTest
@Import(TestcontainersConfiguration.class)
public class TaskControllerContextTest {
    // ...
}
```

Another important change is that I now also need to make sure my schema is properly initialized.
To do this, you can do this in several ways, but the easiest way is by relying on a framework such as **Flyway** to execute your datbaase migrations for you. 

And then finally, we also need to make sure that before each test, all data is certainly cleared and that there is a test user present.
The easiest way to provide this is by creating a SQL file:

```sql
delete from task;
delete from "user";
insert into "user" (id, username, password)
values ('11111111-1111-1111-1111-111111111111', 'user1', '{bcrypt}$2a$12$3reNTTIFP4ho5SLimvGoJeSJkoKAVSo2nJb.cUhrxHf4nArAbJu46');
```

Then we change our test so that SQL file is exeucted before every test:

```java
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Sql(scripts = "classpath:test-data.sql")
public class TaskControllerContextTest {
    private static final UserId USER1_ID = new UserId(UUID.fromString("11111111-1111-1111-1111-111111111111"));

    // ...
}
```

And then the final change is that we should no longer rely on Mockito to verify whether the `TaskService.create()` method was invoked.
The goal of our test now is to verify that a task has actually been persisted into the database.
To do this, I'm going to autowire `TaskRepository` into my test:

```java
@SpringBootTest
@Import(TestcontainersConfiguration.class)
@Sql(scripts = "classpath:test-data.sql")
public class TaskControllerContextTest {
    private static final UserId USER1_ID = new UserId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
    private RestTestClient client;
    @Autowired
    private WebApplicationContext context;
    @Autowired
    private TaskRepository repository;
    
    // ...
}
```

After doing all that, we can finally write out `createTask()` test again:

```java
@Test
@WithUserDetails("user1")
void createTask() {
    var body = """
    {
        "description": "test description",
        "dueAt": "2026-01-01T00:00:00Z"
    }
    """;
    client
        .post()
        .contentType(MediaType.APPLICATION_JSON)
        .body(body)
        .exchange()
        .expectStatus().isCreated()
        .expectBody()
        .jsonPath("$.id").isNotEmpty()
        .jsonPath("$.description").isEqualTo("test description")
        .jsonPath("$.dueAt").isEqualTo("2026-01-01T00:00:00Z")
        .jsonPath("$.completed").isEqualTo(false);
    assertThat(repository.findAllByUserId(USER1_ID))
        .extracting(Task::getDescription, Task::getDueAt, Task::isCompleted)
        .containsOnly(tuple("test description", Instant.parse("2026-01-01T00:00:00Z"), false));
}
```

In this test there are two major differences. First of all, I'm no longer relying on `Mockito.verify()` like I mentioned.
The other big change is that I'm not setting any basic authentication header anymore.
This is an **important difference**, because if you bind `RestTestClient` to your application context, then the security filter chain is bypassed ([see relevant issue](https://github.com/spring-projects/spring-framework/issues/35646)).
So in order to use my `CustomUserDetails`, I am now relying on the `@WithUserDetails()` annotation.

## Binding `RestTestClient` to an actual server

The final mode to test with `RestTestClient` is to run it against an actual server.
To do this, I'm going to re-use a lot of the setup of my previous example because I'll need to use `@SpringBootTest` again and set up some test data:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
@Sql(scripts = "classpath:test-data.sql")
public class TaskControllerServerTest {
    private static final UserId USER1_ID = new UserId(UUID.fromString("11111111-1111-1111-1111-111111111111"));
    private RestTestClient client;
    @Autowired
    private TaskRepository repository;
    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        client = RestTestClient
            .bindToServer()
            .baseUrl("http://localhost:%s/api/task".formatted(port))
            .build();
    }
    
    // ...
}
```

The major difference from before is that I'm now no longer autowiring any `WebApplicationContext`.
Instead, I'm running my Spring Boot application on a random port (see the `webEnvironment` within `@SpringBootTest`) and then I'm "autowiring" the port by using the `@LocalServerPort` annotation.

Then finally, I'm using `bindToServer()` and configuring the base URL to contain `http://localhost:{port}/api/task`.

Now for the testing, I can re-use a lot of things from the previous two examples combined.
This is because I'll now test using the `TaskRepository` again, but now I'll also be able to use authentication like within my test using `MockMvc`:

```java
@Test
void createTask() {
    var body = """
    {
        "description": "test description",
        "dueAt": "2026-01-01T00:00:00Z"
    }
    """;
    client
        .post()
        .contentType(MediaType.APPLICATION_JSON)
        .headers(headers -> headers.setBasicAuth("user1", "password1"))
        .body(body)
        .exchange()
        .expectStatus().isCreated()
        .expectBody()
        .jsonPath("$.id").isNotEmpty()
        .jsonPath("$.description").isEqualTo("test description")
        .jsonPath("$.dueAt").isEqualTo("2026-01-01T00:00:00Z")
        .jsonPath("$.completed").isEqualTo(false);
    assertThat(repository.findAllByUserId(USER1_ID))
        .extracting(Task::getDescription, Task::getDueAt, Task::isCompleted)
        .containsOnly(tuple("test description", Instant.parse("2026-01-01T00:00:00Z"), false));
}
```

## Conclusion

With `RestTestClient` we can easily use the same API for multiple types of tests.
Personally, I have mixed feelings with this approach.
On first sight, it looks very interesting, but when you start testing actual code, you'll notice that various differences "creep" in such as the way you need to authenticate.

Another thing I noticed is that if you bind `RestTestClient` to `MockMvc`, you cannot access the full capabilities of `MockMvc`.
For example, it does not seem to be possible to register a `RequestPostProcessor`.
These are commonly used when writing `MockMvc` tests with Spring Security, as they allow you to easily set up authentication, OAuth2 tokens, CSRF tokens and so on (take a look at [the documentation](https://docs.spring.io/spring-security/reference/servlet/test/mockmvc/request-post-processors.html)).
So if you're writing tests with `MockMvc` I would personally avoid `RestTestClient` and keep using either `MockMvc` or the recently introduced `MockMvcTester`.

Personally, I would mostly use `RestTestClient` with its capability of binding to an application context.
This allows you to write full integration tests with the exception of testing the filterchain of Spring Security.
This means you don't have to worry about things like CSRF, and if you want to test as various users you can use the various Spring Security annotations such as `@WithUserDetails` and `@WithAnonymousUser`.
If you use a library like [**spring-addons**](https://github.com/ch4mpy/spring-addons), you can also use additional annotations such as `@WithJwt` and `WithMockAuthentication`.

Also, if you're worried about the performance of your tests with an application context, I would suggest you check out [Spring Modulith](https://spring.io/projects/spring-modulith).
Spring Modulith comes with an `@ApplicationModuleTest` annotation that behaves similar to `@SpringBootTest` with the exception that it only loads the beans of the current module you're in.
So if you have a project with multiple modules, you can still have some isolation in your tests!

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).