---
title: "Testing your REST controllers and clients with Spring"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["MockMVC", "REST", "Spring", "Spring boot", "Testing"]
excerpt: "Spring allows you to easily develop REST API's and clients. With MockMvc and MockRestServiceServer, the same easiness can be applied to your tests as well."
---

That Spring allows you to easily develop REST APIs, is probably something we all know by now. With MockMvc and MockRestServiceServer, the same can be said to testing those REST APIs and clients. If you didn't know this, then you're at the right place to learn about it, as we'll explore those options today!

### Setting up tests for your controllers

When testing controllers, you can write some unit tests that verify if a specific method call (eg. a service call) is made when a controller method is invoked, but you can also test if the entire mapping properly works, by using [`MockMvc`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/test/web/servlet/MockMvc.html).

Let's say we have a controller that allows us to get some famous movie quotes, which has a `findAll()` operation like this:

```java
@AllArgsConstructor
@RestController
@RequestMapping("/api/movie-quote")
public class MovieQuoteController {
    private MovieQuoteService service;

    @GetMapping
    public List<MovieQuote> findAll(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int pageSize) {
        return service.findAll(page, pageSize);
    }
}
```

Now, to set up MockMvc, we need to annotate our tests with both `@RunWith(SpringRunner.class)` and the `@WebMvcTest` annotation. For example:

```java
@WebMvcTest
@RunWith(SpringRunner.class)
public class MovieQuoteControllerTest {
    // TODO: Implement your tests
}
```

By doing this, Spring will set up MockMvc for us, and we can autowire it properly:

```java
@Autowired
private MockMvc mockMvc;
@MockBean
private MovieQuoteService service;
```

As you can see, we're also using the `@MockBean` annotation so that we can provide a mocked version of our `MovieQuoteService` as a bean. The nice thing about the `@WebMvcTest` annotation is that it won't load your entire application context, but only the web layer. That means that if we didn't mock this bean, it wouldn't call the actual implementation, it would just not be able to find a bean.

### Writing your first MockMvc test

Now, to start a test, we have to create a new method using the `@Test` annotation, for example:

```java
@Test
public void getMovieQuotes_shouldUseFindAll() throws Exception {
    // TODO: Implement test
}
```

Within the method body, we usually do two things:

1. We mock the results of our service calls
2. We define our expectations and our API call using MockMvc

When we want to write a test for our previously defined controller method, we'll have to mock the `service.findAll()` method:

```java
Movie movie = Movie.builder().id(1L).name("Terminator").build();
when(service.findAll(0, 10)).thenReturn(Lists.newArrayList(
    MovieQuote.builder().id(1L).movie(movie).quote("Hasta la vista, baby").build(),
    MovieQuote.builder().id(2L).movie(movie).quote("I'll be back").build()
));
```

Note, I'm aware that both quotes were first seen in a different movie within the Terminator franchise, but hey, I'm lazy!

The next step is to use MockMvc to make our API call and write our expectations:

```java
this.mockMvc
    .perform(get("/api/movie-quote"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$[*]", hasSize(2)))
    .andExpect(jsonPath("$[0].id", is(1)))
    .andExpect(jsonPath("$[0].quote", is("Hasta la vista, baby")))
    .andExpect(jsonPath("$[0].movie.id", is(1)))
    .andExpect(jsonPath("$[0].movie.name", is("Terminator")))
    .andExpect(jsonPath("$[1].id", is(2)))
    .andExpect(jsonPath("$[1].quote", is("I'll be back")))
    .andExpect(jsonPath("$[1].movie.id", is(1)))
    .andExpect(jsonPath("$[1].movie.name", is("Terminator")));
```

As you can see, MockMvc uses a **fluent API**, where we can add multiple expectations. In this case I chose to use JSONPath to properly identify certain fields within my JSON response.

### Capturing the request body of your controller

With the test we've just seen, we're able to write most tests. One exception is when we have a request body, which we often use to create or update some data. For example:

```java
@PostMapping
public MovieQuote create(@RequestBody MovieQuoteInput input) {
    return service.create(input);
}
```

Now, if we want to write a test for this, we have to be able to send the request body, and verify that it's correctly parsed and passed to the service.

In this case, we'll use the `ArgumentMatchers.any()` matcher of Mockito to be able to return a result from our service:

```java
Movie movie = Movie.builder().id(1L).name("Terminator").build();
MovieQuote quote = MovieQuote.builder().id(1L).movie(movie).quote("Hasta la vista, baby").build();
when(service.create(any())).thenReturn(quote);
```

After that, we can perform our POST, and pass some content with MockMvc:

```java
this.mockMvc
    .perform(post("/api/movie-quote")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"quote\":\"Hasta la vista, baby\", \"movie\": \"Terminator\"}"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.id", is(1)))
    .andExpect(jsonPath("$.quote", is("Hasta la vista, baby")))
    .andExpect(jsonPath("$.movie.id", is(1)))
    .andExpect(jsonPath("$.movie.name", is("Terminator")));
```

The final step is to capture the arguments passed to the `service.create(..)` method by using Mockito's `ArgumentCaptor` API:

```java
ArgumentCaptor<MovieQuoteInput> anyQuote = forClass(MovieQuoteInput.class);
verify(service).create(anyQuote.capture());
assertThat(anyQuote.getValue().getMovie()).isEqualTo("Terminator");
assertThat(anyQuote.getValue().getQuote()).isEqualTo("Hasta la vista, baby");
```

Using the `ArgumentCaptor` we can verify if the JSON request matches the `MovieQuoteInput` class.

### Testing exception handlers

A nice feature with Spring Web is the possibility to define exception handlers easily by using the `@ExceptionHandler`annotation:

```java
@ExceptionHandler(MovieQuoteNotFoundException.class, MovieNotFoundException.class)
@ResponseStatus(HttpStatus.NOT_FOUND)
public String notFound(MovieQuoteNotFoundException ex) {
    return ex.getMessage();
}
```

In this case, our code will return a 404 when a `MovieQuoteNotFoundException` is thrown anywhere within our code. We'll simply return the message of the exception, which in our case is a message like: "Quote with id '1' was not found", for example:

```java
@NoArgsConstructor
@AllArgsConstructor
public class MovieQuoteNotFoundException extends RuntimeException {
    private Long id;

    @Override
    public String getMessage() {
        return format("Quote with id ''{0}'' was not found", id);
    }
}
```

Now, to write a test for this, we'll use Mockito to throw the specific exception when certain service is invoked:

```java
when(service.findById(1L)).thenThrow(new MovieQuoteNotFoundException(1L));
```

After that, we can write our expectations with MockMVC, just like before:

```java
this.mockMvc
    .perform(get("/api/movie-quote/1"))
    .andExpect(status().isNotFound())
    .andExpect(content().string("Quote with id '1' was not found"));
```

With that, we can do pretty much anything with MockMvc.

### Testing your REST client

Another nice feature of Spring is the `RestTemplate`, which allows us to easily define which REST calls should be made.

Now, let's say we have a client that calls our `GET /api/movie-quote` operation, which we defined earlier. To do that, we would write something like this:

```java
@Component
@AllArgsConstructor
public class MovieQuoteClient {
    private RestTemplate restTemplate;

    public List<MovieQuote> findAll(int page, int pageSize) {
        return restTemplate
            .exchange("/movie-quote?page={page}&pageSize={pageSize}", HttpMethod.GET, null, new ListReference(), page, pageSize)
            .getBody();
    }

    private class ListReference extends ParameterizedTypeReference<List<MovieQuote>> { }
}
```

Due to the fact that we're using a generic (`List<MovieQuote>`), we have to use a `ParameterizedTypeReference`, which we've defined as a private inner class.

Now, when writing tests for this, you can simply use Mockito to verify that the arguments are correct, or you could use [`MockRestServiceServer`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/test/web/client/MockRestServiceServer.html) to define your tests.

Just like before, we have to add specific annotations to our test to make this happen. In this case, we have to use both `@RunWith(SpringRunner.class)` and the `@RestClientTest` annotation:

```java
@RunWith(SpringRunner.class)
@RestClientTest({MovieQuoteClient.class, MovieQuoteClientConfiguration.class})
public class MovieQuoteClientTest {
    // TODO: Implement tests
}
```

As you can see, we're adding both the `MovieQuoteClient.class` as a class called `MovieQuoteClientConfiguration.class` to the `@RestClientTest`. This allows Spring to setup the client, and the `RestTemplate` bean, which I've setup within `MovieQuoteClientConfiguration`:

```java
@Bean
public RestTemplate restTemplate(RestTemplateBuilder builder) {
    return builder
        .rootUri("http://localhost:8080/api")
        .build();
}
```

After that, we can autowire the necessary parts in our test:

```java
@Autowired
private MovieQuoteClient client;
@Autowired
private MockRestServiceServer server;
```

In this case, we'll autowire the Spring bean that uses `RestTemplate`, and `MockRestServiceServer` to mock our REST calls.

Now, testing your `RestTemplate`is similar to testing with MockMvc, as it will also contain two steps:

1. Rather than mocking a specific method, we define which REST call should be made, which parameters are expected, and what result should be returned.
2. After that, we can write our assertions using AssertJ.

For the `findAll()` method, we could write our expectations like this:

```java
server
    .expect(once(), requestTo(startsWith("/movie-quote")))
    .andExpect(method(HttpMethod.GET))
    .andExpect(queryParam("page", "0"))
    .andExpect(queryParam("pageSize", "10"))
    .andRespond(withSuccess(new ClassPathResource("movie-quotes.json"), MediaType.APPLICATION_JSON));
```

In this case, I've stored the "dummy response" within a JSON file called **src/test/resources/movie-quotes.json**. This will be returned when all expectations are fulfilled.

The next step is to write our assertions. Since our result will be a list of `MovieQuote` objects, I first wrote a simple class with the methods that could be exctracted within the test:

```java
public final class MovieQuoteExtractors {
    public static Function<MovieQuote, Object> quote() {
        return MovieQuote::getQuote;
    }

    public static Function<MovieQuote, Object> movieName() {
        return quote -> quote.getMovie().getName();
    }

    public static Function<MovieQuote, Object> movieId() {
        return quote -> quote.getMovie().getId();
    }

    public static Function<MovieQuote, Object> id() {
        return MovieQuote::getId;
    }
}
```

This allows us to write assertions like this, and re-use these in other tests:

```java
assertThat(client.findAll(0, 10))
    .extracting(id(), movieId(), movieName(), quote())
    .containsOnlyOnce(
        tuple(1L, 1L, "Terminator", "Hasta la vista, baby"),
        tuple(2L, 1L, "Terminator", "I'll be back"));
```

### Matching the request body

If we want to write a client for our `POST /api/movie-quote` operation, we'll write code like this:

```java
public MovieQuote create(MovieQuoteInput input) {
    return restTemplate.postForObject("/movie-quote", input, MovieQuote.class);
}
```

To test something like this, we have to make sure that the JSON request body matches our expectations, and just like before, we can use JSONPath to do so:

```java
@Test
public void create_callsPostMovieQuotes() {
    server
        .expect(once(), requestTo(startsWith("/movie-quote")))
        .andExpect(method(HttpMethod.POST))
        .andExpect(jsonPath("$.movie", is("Terminator")))
        .andExpect(jsonPath("$.quote", is("I'll be back")))
        .andRespond(withSuccess(new ClassPathResource("movie-quote.json"), MediaType.APPLICATION_JSON));
    assertThat(client.create(MovieQuoteInput.builder().movie("Terminator").quote("I'll be back").build()))
        .extracting(id(), movieId(), movieName(), quote())
        .containsExactly(1L, 1L, "Terminator", "Hasta la vista, baby");
}
```

With that, we're able to write tests for both the controllers we write, as the clients we write on top of these controllers.
