---
title: "Testing code using Spring's WebClient"
featuredImage: "/logos/reactor.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Project Reactor", "Reactive programming", "Testing"]
excerpt: "Since Spring 5, RestTemplate went into maintenance mode and WebClient became the way to go. In this tutorial I'll show how you can write tests for code using WebClient."
---

When writing applications, we often have to communicate to other services. Since Spring 3.0, talking to a REST service became way easier thanks to the `RestTemplate` class.
However, since Spring 5.0, `RestTemplate` went into maintenance mode. This means that only minor requests and bug fixes will be applied. For further development, the new `WebClient` is recommended.

## What is `WebClient`

`WebClient` is the new client for sending web requests, including REST calls. It comes as a part of the reactive framework, and thus, supports asynchronous communication.
It also comes with a more declarative syntax, for example:

```java
Mono<Person> person = WebClient
    .create("http://example.org")
    .get()
    .uri(uriBuilder -> uriBuilder
        .pathSegment("api", "person", "{id}")
        .build(1L))
    .retrieve()
    .bodyToMono(Person.class);
```

Since it comes with the reactive framework, it means the result will come in a reactive way as well.
If you're developing a reactive application, that's no issue. However, most of us are still developing traditional applications.

To immediately get a result, you call the `block()` operator, like this:

```java
Person person = WebClient
    .create("http://example.org")
    .get()
    .uri(uriBuilder -> uriBuilder
        .pathSegment("api", "person", "{id}")
        .build(1L))
    .retrieve()
    .bodyToMono(Person.class)
    .block(); // Add this
```

If you prefer working with optionals, you can also use the `blockOptional()` method.

You might have read on the internet that using the `block()` operator is a bad practice. If you're developing a reactive application, that is certainly the case. However, if you're not writing a reactive application and you want to use `WebClient`, this is **not** a bad thing to do.

### Mocking `WebClient`

If you want to write tests for this piece of logic, one option could be to mock the `WebClient`.
However, there are two downsides with this approach. First of all, you end up with very ugly tests. You'd have to write several mocks to properly mock the entire fluent API.
The second problem is that you would be testing how I call `WebClient` and now how I call the API.

For example, let's say I want to verify that I call the following API: `http://example.org/api/sum?value1=3&value2=5`

There are multiple ways I can use `WebClient` to call this API. I could construct the complete path myself and pass it to the `uri()` or I could use the `UriBuilder`.
But even if I use the `UriBuilder` I could either add the query parameters directly, or I could use template variables or I could even pass all the query parameters as a `MultiValueMap` and it would work.

Summarized, by mocking `WebClient`, you're testing the wrong things.

### Mocking the API

A second solution is to mock the API itself. If you used `RestTemplate` before, you might have crossed the `MockRestServiceServer` class.
This class allows you to write expectations about the request itself, rather than how you create the request.

For example:

```java
server
    .expect(once(), requestTo(startsWith("/api/sum")))
    .andExpect(method(HttpMethod.GET))
    .andExpect(queryParam("value1", "3"))
    .andExpect(queryParam("value2", "5"));
```

Sadly, `MockRestServiceServer` doesn't work with `WebClient`. If you're interested to know more about this class, you can check out [my tutorial about testing `RestTemplate`](https://dimitr.im/testing-your-rest-controllers-and-clients-with-spring#testing-your-rest-client) though.

So, for `WebClient` we have to look for a similar alternative. One alternative is [OkHttp](https://square.github.io/okhttp/)'s `MockWebServer`.

### Adding the dependencies

To get started with this library, you first have to add a few dependencies. If you're using Maven, these are the dependencies you have to add:

```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>mockwebserver</artifactId>
    <version>4.9.1</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>4.9.1</version>
    <scope>test</scope>
</dependency>
```

Beware, the **mockwebserver** library won't work without the **okhttp** library.

### Setting up the test

After that, you can setup the `MockWebServer` in your test:

```java
class MathServiceTest {
    private MathService service;
    private MockWebServer server;
    
    @BeforeEach
    void setUp() throws IOException {
        server = new MockWebServer();
        server.start();
        String rootUrl = server.url("/api/").toString();
        service = new MathService(WebClient.create(rootUrl));
    }
    
    // TODO: write tests
}

```

In this example I'll write a JUnit 5 test, since that's the default testing framework that comes with Spring.
The easiest way to set up the `MockWebServer` is to recreate it before each test, and destroy it after each test.

So, in this `setUp()` method, I'm setting up the `MockWebServer` and passing the URL to the `WebClient` so that it uses this URL as the base URL for API calls.

In addition, I also wrote a `tearDown()` method to shut down the server:

```java
@AfterEach
void tearDown() throws IOException {
    server.shutdown();
}
```

### Writing the tests

Now you can write a test like this:

```java
@Test
void sum_usesSumAPI() throws InterruptedException {
    MockResponse response = new MockResponse();
    server.enqueue(response);
    Integer result = service.sum(5, 3).block();
    RecordedRequest request = server.takeRequest();
    assertThat(request.getMethod()).isEqualTo("GET");
    assertThat(request.getPath()).startsWith("/api/sum");
    assertThat(request.getRequestUrl().queryParameter("value1")).isEqualTo("5");
    assertThat(request.getRequestUrl().queryParameter("value3")).isEqualTo("3");
}
```

As you can see, we're adding a `MockResponse` and are retrieving a `RecordedRequest` from the `MockWebServer` to check whether the path was correct.

The `RecordedRequest` has several methods we can use to write assertions agains. In this case we used `getMethod()` to verify the HTTP method, `getPath()` to verify what the path contains, and `getRequestUrl()` to see what the query parameters are.

To be sure that the request was completed before the `takeRequest()` was called, we're using the `block()` method. This depends on whether you're returning a `Mono` or whether you're already blocking in your code.

If you're using reactive streams and want to write more assertions based on the values of that stream, you can also use Project Reactor's `StepVerifier`:

```java
@Test
void sum_usesSumAPI() throws InterruptedException {
    MockResponse response = new MockResponse();
    server.enqueue(response);
    StepVerifier
        .create(service.sum(5, 3))
        // TODO: Write expectations with StepVerifier
        .verifyComplete();
    RecordedRequest request = server.takeRequest();
    assertThat(request.getMethod()).isEqualTo("GET");
    assertThat(request.getPath()).startsWith("/api/sum");
    assertThat(request.getRequestUrl().queryParameter("value1")).isEqualTo("5");
    assertThat(request.getRequestUrl().queryParameter("value3")).isEqualTo("3");
}
```

### Sending a response

If you want to send a response, you can do so by calling the `addHeader()` and `setBody()` methods of `MockResponse`.
For example:

```java
MockResponse response = new MockResponse()
    .addHeader("Content-Type", "application/json")
    .setBody("8");
```

This allows you to write an assertion within your test based on the return value. For example:

```java
// ...
Integer sum = service.sum(5, 3).block();
assertThat(sum).isEqualTo(8);
// ...
```

If you want to send a more complex response, I recommend using a separate file (eg. **response.json**) and load it like this:

```java
Path responseFile = Paths.get(getClass().getResource("response.json").toURI());
String responseBody = Files.readString(responseFile, defaultCharset());
MockResponse response = new MockResponse()
    .addHeader("Content-Type", "application/json")
    .setBody(responseBody);
```

### Conclusion

With `RestTemplate` entering maintenance mode, more people will likely make the switch to `WebClient` or other alternatives.
Regardless of what type of client you use, you should be testing which API you're calling rather than specifically testing which methods you use.
This certainly applies when using a framework that gives you several options to achieve the same thing.

As mentioned in this tutorial, OkHttp's `MockWebServer` can be really helpful in this situation.