---
title: "Testing your Spring boot controllers"
featuredImage: "../../../images/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Java", "Spring boot", "Testing", "AssertJ", "JUnit", "Mockito", "MockMVC"]
excerpt: "Due to the many annotations you use on controllers, they require a specific way to be tested. In this tutorial I'll show you how we can write such tests."
---

### What's special about controllers?

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
import jdk.jfr.StackTrace;

@ExtendsWith(MockitoExtension.class)
class UserControllerTest {
    @InjectMocks
    private UserController controller;
    @Mock
    private UserFacade facade;

    @Test
    void createUser_returnsFacadeResult() {
        var dto = new UserInfoDTO();
        var request = new CreateUserRequestDTO('me@example.org', 'Dimitri', 'password123');
        when(facade.createUser(any())).thenReturn(dto);
        
        
    }
}
```