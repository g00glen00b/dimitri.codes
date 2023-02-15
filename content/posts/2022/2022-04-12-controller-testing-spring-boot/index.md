---
title: "Testing your Spring boot controllers"
featuredImage: "../../../images/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Java", "Spring boot", "Testing", "AssertJ", "JUnit", "Mockito", "MockMVC"]
excerpt: "Due to the many annotations you use on controllers, they require a specific way to be tested. In this tutorial I'll show you how we can write such tests."
---

## What's special about controllers?

During [my previous tutorial](./unit-testing-spring-boot), I explained how you can write unit tests for your code.
We could apply the same rules, and unit test our controllers.

For example, let's say we have the following controller:

```java
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
class UserController {
    private final UserFacade facade;

    @PostMapping
    public UserInfoDTO createUser(@RequestBody CreateUserRequestDTO request) {
        return facade.createUser(request);
    }
}
```

We could write a unit test like this:

```java
@ExtendsWith(MockitoExtension.class)
class UserControllerTest {
    @InjectMocks
    private UserController controller;
    @Mock
    private UserFacade facade;

    @Test
    void createUser_returnsFacadeResult() {
        var dto = new UserInfoDTO();
        var request = new CreateUserRequestDTO("me@example.org", "Britanny Jackson", "password", ZoneId.of("Australia/Brisbane"));
        when(facade.createUser(any())).thenReturn(dto);
        
        var result = controller.createUser(request);
        assertThat(result).isSameAs(dto);
        verify(facade).createUser(request);
    }
}
```

While a test like this would be better than having no test at all, there is one problem with this test.
These tests do not verify whether the right HTTP method is used, whether the parameters are correctly passed and whether the correct HTTP status is returned.

One alternative is to bootstrap a Spring Boot application and use a REST-client to invoke your REST API.
The downside of this approach is that this will make your tests a lot slower to run.

Another alternative is to use MockMvc. MockMvc is a part of the Spring framework that makes testing controllers easier.
The way it works is that it encapsulates all the servlet-related beans so that you no longer have to run a full servlet container to test your controllers.

## Using MockMvc

Setting up a test with MockMvc can be done by using the `@WebMvcTest` annotation. 
This test-slice annotation makes it so that only the web-related beans are bootstrapped.
Other beans (database, batch, services, ...) will not be bootstrapped.

For example:

```java
@WebMvcTest(controllers = UserController.class)
@Import(WebSecurityConfiguration.class)
class UserControllerTest {
    // TODO: implement
}
```

As you can see, the `@WebMvcTest` annotation comes with a `controllers` argument where you can pass one or more controllers that will be bootstrapped.
In addition, I'm using the `@Import` annotation to include the security-related configuration of my project.

The next step is to autowire MockMvc and to mock the dependencies of your controllers (eg. services):

```java
@Autowired
private MockMvc mockMvc;
@MockBean
private UserFacade facade;
```

The reason why we autowire MockMvc is because it provides a lot of utility methods to perform requests and write assertions.

## Writing your first test

Now that our test class is ready, we can write our first test:

```java
@Test
void create_200() throws Exception {
    // TODO: implement
}
```

The first thing we have to do is mock any calls made to our services.
Since the `@MockBean` annotation relies on Mockito, we can use Mockito's `when()` method to mock our services:

```java
UUID id = UUID.randomUUID();
UserInfoDTO user = new UserInfoDTO(id, "me@example.org", "Brittany Jackson", ZoneId.of("Australia/Brisbane"));
when(facade.create(any())).thenReturn(user);
```

Once done, it's time to call our API.
The way to do this is not by autowiring our controller, but by using the `mocKMvc.perform()` method:

```java
mockMvc.perform(post("/api/user")
```

If we want to pass some content, we can use the `.content()` method:

```java
mockMvc
    .perform(post("/api/user")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
        {
            "email": "me@example.org",
            "name": "Britanny Jackson",
            "password": "password",
            "timezone": "Australia/Brisbane"
        }
        """))
```

> **Note**: I'm using Java 15's text blocks to make it easier to pass a JSON string.

> **Note**: The `contentType()` and `content()` methods should be applied on the return value of the `post(..)` method and not on the return value of the `perform()` method.
> This is why I indented the `contentType()` and `content()` method a second time.

In this case, you could also use `ObjectMapper` to create a JSON string from a Java object, but I don't like that.
Imagine this, you have a DTO with a `@JsonProperty` annotation, but you made a typographical error (eg. `@JsonProperty("usr")` in stead of `@JsonProperty("user")`).
If you use Jackson's `ObjectMapper` to create the request body, and you use Jackson's `ObjectMapper` to write assertions, you will never find out about these mistakes.

If you pass the JSON as a string in stead, you'd notice that your test will fail.

## Writing assertions

After this, we can write our expectations by using the `andExpect()` method.
One assertion we could write is to check whether the response status is 200 OK:

```java
mockMvc
    .perform(post("/api/user")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
        {
            "email": "me@example.org",
            "name": "Britanny Jackson",
            "password": "password",
            "timezone": "Australia/Brisbane"
        }
        """))
    .andExpect(status().isOk())
```

Another assertion we can make is to test whether the response contains the mocked response of our `facade.create()` method.
The way I do that is by using a JSONPath expression.
For example, the ID property of the JSON response should contain the same value as the `id` variable in our test:

```java
mockMvc
    .perform(post("/api/user")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
        {
            "email": "me@example.org",
            "name": "Britanny Jackson",
            "password": "password",
            "timezone": "Australia/Brisbane"
        }
        """))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.id", is(id.toString())));
```

After the MockMvc method calls we can also use Mockito's assertions to check whether a method was called.
For example, in our test the `facade.create()` method should have been called with the parameters passed within the `content()` method:

```java
verify(facade).create(new CreateUserRequestDTO("me@example.org", "Britanny Jackson", "password", ZoneId.of("Australia/Brisbane")));
```

## Testing with Spring Security

MockMvc also comes with some extra methods to work with Spring Security.

For example, if I want to verify if a method works while being an anonymous user, I can use the: `with(anonymous())` method:

```java
mockMvc
    .perform(post("/api/user")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
        {
            "email": "me@example.org",
            "name": "Britanny Jackson",
            "password": "password",
            "timezone": "Australia/Brisbane"
        }
        """)
        // Add this
        .with(anonymous())
```

If I want to test using a specific user, I can create an `UserDetails` object and pass it with `with(user(userDetails))`:

```java
// Add this
UserAuthentication userDetails = new UserAuthentication(id, "me@example.org", "password");

mockMvc
    .perform(put("/api/user")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
        {
            "name": "Britanny Jackson",
            "timezone": "Australia/Brisbane"
        }
        """)
        // Add this
        .with(user(userDetails)))
```

If I want to generate a CSRF token, I can use the `with(csrf())` method:

```java
mockMvc
    .perform(post("/api/user")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
        {
            "email": "me@example.org",
            "name": "Britanny Jackson",
            "password": "password",
            "timezone": "Australia/Brisbane"
        }
        """)
        .with(anonymous())
        // Add this
        .with(csrf()))
```