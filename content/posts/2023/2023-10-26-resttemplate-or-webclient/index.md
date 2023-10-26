---
title: "Battle of the Spring REST clients: RestTemplate, WebClient or RestClient?"
featuredImage: "../../../images/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring boot", "Spring"]
excerpt: "In this blogpost, I'll talk about the differences of Spring's RestTemplate and WebClient, and I will also talk about the new RestClient."
---

## Intro

Recently, I've seen a few discussions where people were talking about whether they should use `RestTemplate` or `WebClient`.
One of their arguments is that you should use `WebClient` because `RestTemplate` is deprecated (spoiler alert: it's not!).
In this blogpost I'll talk about the options you have within the Spring framework to make REST calls.

## Contents

1. [RestTemplate](#resttemplate)
   1. [Setup](#setup)
   2. [Retrieving data](#retrieving-data)
   3. [Sending data](#sending-data)
   4. [Error handling](#error-handling)
   5. [Testing](#testing)
   6. [Pros](#pros)
   7. [Cons](#cons)
2. [WebClient](#webclient)
   1. [Setup](#setup-1)
   2. [Retrieving data](#retrieving-data-1)
   3. [Sending data](#sending-data-1)
   4. [Error handling](#error-handling-1)
   5. [Testing](#testing-1)
   6. [Pros](#pros-1)
   7. [Cons](#cons-1)
3. [RestClient](#restclient)
   1. [Setup](#setup-2)
   2. [Retrieving data](#retrieving-data-2)
   3. [Sending data](#sending-data-2)
   4. [Error handling](#error-handling-2)
   5. [Pros](#pros-2)
   6. [Cons](#cons-2)
4. [Deprecation?](#deprecation)
5. [Conclusion](#conclusion)

## RestTemplate

### Setup

`RestTemplate` is the true OG. It has been available since Spring 3.0 (that's from before Spring Boot was born) and supports synchronous HTTP requests.
This client has several methods available, such as `getForObject()`, `getForEntity()`, `exchange()`, ... .

The easiest way to construct a `RestTemplate` is by creating a bean based on the `RestTemplateBuilder`.
For example:

```java
@Bean
public RestTemplate dummyAPIRestTemplate(RestTemplateBuilder builder) {
    return builder.rootUri("https://dummyjson.com").build();
}
```

This setup allows you to add additional interceptors, configure a root URL, ... .

### Retrieving data

After that, you can autowire the `RestTemplate` bean and call one of its [many methods](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/client/RestTemplate.html#method-summary).
For example:

```java
Product product = restTemplate.getForObject("/products/1", Product.class);
logger.info("Found product: {}", product);
```

Alternatively, you can also use URL variables:

```java
Product product = restTemplate.getForObject("/products/{id}", Product.class, 1);
logger.info("Found product: {}", product);
```

In the example above, `{id}` is a URL variable.
Spring will then replace them with the provided URL variables (`1`) in the same order as they're in the URL.

If you prefer using the names, you can also provide a `Map`:

```java
Map<String, Object> variables = Map.of("id", 1);
Product product = restTemplate.getForObject("/products/{id}", Product.class, variables);
logger.info("Found product: {}", product);
```

If you're interested in the response headers, the `getForObject()` method won't work.
In that case, you can use the `getForEntity()` method.
This method returns a `ResponseEntity` wrapper which incldudes both the headers and the body.
For example:

```java
Map<String, Object> variables = Map.of("id", 1);
ResponseEntity<Product> entity = restTemplate.getForEntity("/products/{id}", Product.class, variables);
logger.info("Found product: {}", entity.getBody());
logger.info("Found headers: {}", entity.getHeaders());
```

### Sending data

If you want to send data, you can use the `postForObject()` method.
For example:

```java
CreateProductRequest request = new CreateProductRequest("Banana");
Product product = restTemplate.postForObject("/products/add", request, Product.class);
logger.info("Created product: {}", product);
```

In this example, `CreateProductRequest` is a class that follows the JSON specification of the request body of the [DummyJSON API](https://dummyjson.com/).

For other HTTP methods such as `PUT`, there isn't a `putForObject()` method.
In that case, you have to rely on the `exchange()` method.
For example:

```java
UpdateProductRequest request = new UpdateProductRequest("Bananaaaaa");
HttpEntity<UpdateProductRequest> httpEntity = new HttpEntity<>(request, null);
RequestEntity<Product> entity = restTemplate.exchange("/products/101", HttpMethod.PUT, httpEntity, Product.class);
logger.info("Updated product: {}", entity.getBody());
```

With the `exchange()` method, you always get a `ResponseEntity` like in the `postForEntity()` method.
In addition, rather than passing the request body immediately, you have to provide an `HttpEntity`.
This class accepts both a request body and request headers.
In this example, I'm passing `null` as the headers.

### Error handling

To handle errors, you can catch `RestClientResponseException` for all errors, or one of its implementations such as `HttpClientErrorException` to only handle certain errors.
For example:

```java
try {
    Map<String, Object> variables = Map.of("id", -1);
    Product product = restTemplate.getForObject("/products/{id}", Product.class, variables);
    logger.info("Found product: {}", product);
} catch (HttpClientErrorException ex) {
    DummyAPIError error = ex.getResponseBodyAs(DummyAPIError.class);
    logger.error("Retrieving product failed: {}", error.message(), ex);
}
```

In this example, the code snippet will print `Retrieving product failed: Product with id '-1' not found`.

### Testing

Testing with `RestTemplate` can be done with `MockRestServiceServer`.
`MockRestServiceServer` intercepts call to the `RestTemplate` (so no actual network traffic happens), and comes with a whole assertion library.

To use this, annotate your test with `@RestClientTest`, autowire `MockRestServiceServer` and then you can write tests like this:

```java
server
    .expect(once(), requestTo(startsWith("https://dummyjson.com/products/1")))
    .andExpect(method(HttpMethod.GET))
    .andRespond(withSuccess(new ClassPathResource("dummy-product.json"), MediaType.APPLICATION_JSON));
```

In this test I'm verifying that a request is made to `/products/1`, and I respond with a JSON that I put in a file called `dummy-product.json`.
You can read more about this in my [tutorial about testing your rest clients with Spring](https://dimitri.codes/testing-your-rest-controllers-and-clients-with-spring/).

### Pros

The main advantage of `RestTemplate` is that it has a **rich ecosystem**.
There are integrations with various other parts of the Spring framework (like Spring Cloud), there is support for testing and so on.

### Cons

One of the drawbacks of `RestTemplate` is that the API feels dated.
In addition, due to it being based on `HttpURLConnection`, there is no support for PATCH-requests, though this can be added by using the `HttpComponentsClientHttpRequestFactory`.
To use this, you need to add the [Apache HttpComponents](https://hc.apache.org/) library.

The last drawback is that `RestTemplate` only supports synchronous, blocking requests.
If you're interested in using non-blocking communication, `RestTemplate` isn't for you.

## WebClient

### Setup

Since Spring 5.0 and Spring Boot 2.0, reactive support was added to the framework.
One of these classes is the `WebClient`, which allows you to perform HTTP requests in a reactive way.
This means that `WebClient` is asynchronous and non-blocking by default.

To use it, you can create a `WebClient` bean using the builder:

```java
@Bean
public WebClient dummyAPIWebClient(WebClient.Builder builder) {
    return builder
        .baseUrl("https://dummyjson.com")
        .build();
}
```

### Retrieving data

To use the `WebClient`, you can use its fluent API.
For example, to retrieve data, you can use:

```java
Mono<Product> productMono = webClient
    .get()
    .uri(builder -> builder
        .path("/products/1")
        .build())
    .retrieve()
    .bodyToMono(Product.class);
productMono.subscribe(product -> logger.info("Found product: {}", product));
```

Important here to realize is that whatever the `WebClient` returns is a reactive `Publisher`.
At the time you get the `productMono`, the HTTP request **has not been executed yet**!

To asynchronously execute whatever logic is within your reactive pipeline, you need to add a subscriber.
This is done by adding the `subscribe()` statement.
But be aware that even then, you can only access the return value from within the `subscribe()` callback.

You can use the `block()` method to immediately return a value.
But using `block()` is not recommended because you will be going back to synchronous, blocking API calls.
So, since you shouldn't use `block()` and you can only retreive the data within the reactive pipeline, it means that you should write your code so that everything works with reactive elements.

One of the nice parts of this fluent API is that it also comes with a fluent API to build the URL.
So far, we've only used the `path()`, but you can also use `pathSegment()`, `queryParam()` and so on.

You can also work with URL variables just like within `RestTemplate`. For example:

```java
webClient
    .get()
    .uri(builder -> builder
        .pathSegment("products", "{id}") // Add a URL variable
        .build(Map.of("id", 1))) // Map each URL variable
    .retrieve()
    .bodyToMono(Product.class)
    .subscribe(product -> logger.info("Found product: {}", product));
```

### Sending data

To send data, you can write the following code:

```java
CreateProductRequest request = new CreateProductRequest("Banana");
webClient
    .post()
    .uri("/products/add")
    .bodyValue(request)
    .retrieve()
    .bodyToMono(Product.class)
    .subscribe(product -> logger.info("Created product: {}", product));
```

By using the `bodyValue()` method, we can pass a plain Java object.
If the request body comes from another reactive stream, we can pass the `Mono` or `Flux` by using the `body()` method in stead.
For example:

```java
// I'm using Mono.just() to illustrate that this works
// Usually you won't wrap objects with Mono.just()
Mono<CreateProductRequest> requestMono = Mono.just(new CreateProductRequest("Banana"));
webClient
    .post()
    .uri("/products/add")
    .body(requestMono, CreateProductRequest.class)
    .retrieve()
    .bodyToMono(Product.class)
    .subscribe(product -> logger.info("Created product: {}", product));
```

The same can be applied to send a PUT request:

```java
UpdateProductRequest request = new UpdateProductRequest("Bananaaaaa");
webClient
    .put()
    .uri("/products/101")
    .bodyValue(request)
    .retrieve()
    .bodyToMono(Product.class)
    .subscribe(product -> logger.info("Updated product: {}", product));
```

### Error handling

When you subscribe to a reactive publisher, you can not only subscribe for values, but also subscribe to any error that might happen.
By default, `WebClient` returns an error of type `WebClientResponseException` when it encounters any 4xx or 5xx status.

To listen to these, you can use:

```java
webClient
    .get()
    .uri(builder -> builder
        .pathSegment("products", "{id}")
        .build(Map.of("id", -1)))
    .retrieve()
    .bodyToMono(Product.class)
    .subscribe(
        product -> logger.info("Found product: {}", product),
        ex -> logger.error("An error occured", ex));
```

Alternatively, if you just want to do a side effect for certain exception types, you can use the `doOnError()` handler:

```java
webClient
    .get()
    .uri(builder -> builder
        .pathSegment("products", "{id}")
        .build(Map.of("id", -1)))
    .retrieve()
    .bodyToMono(Product.class)
    .doOnError(WebClientResponseException.class, ex -> {
        DummyAPIError error = ex.getResponseBodyAs(DummyAPIError.class);
        logger.error("Retrieving product failed: {}", error.message(), ex);
    })
    .subscribe(product -> logger.info("Found product: {}", product));
```

Within the `doOnError()` method, you can specify the exception type you want to listen for.
This allows you to listen to exceptions such as `WebClientResponseException`. 
In addition, the `WebClientResponseException` has a `getResponseBodyAs()` method to deserialize the response body to a Java object.

If you want more control about which exception is thrown, you can also use the `onStatus()` method before you call the `bodyToMono()` function:

```java
webClient
    .get()
    .uri(builder -> builder
        .pathSegment("products", "{id}")
        .build(Map.of("id", -1)))
    .retrieve()
    .onStatus(HttpStatusCode::is4xxClientError, response -> response
        .bodyToMono(DummyAPIError.class)
        .map(InvalidProductException::new)
        .flatMap(Mono::error))
    .bodyToMono(Product.class)
    .subscribe(product -> logger.info("Found product: {}", product));
```

This method comes with two arguments.
The first argument is a predicate you can provide to filter out certain errors.
In this example I'm only listening for 4xx errors.

The second argument returns the response, and expects a `Mono.error()` in return.
To create a `Mono.error()`, you need to provide an exception, so I created an `InvalidProductException` that accepts a `DummyAPIError` as a parameter.

```java
public class InvalidProductException extends RuntimeException {
    private final DummyAPIError error;

    public InvalidProductException(DummyAPIError error) {
        this.error = error;
    }

    @Override
    public String getMessage() {
        return this.error.message();
    }
}
```

If you want to apply this status handler to all requests, you can move this to the `WebClient.Builder` itself.
For example:

```java
builder
    .baseUrl("https://dummyjson.com")
    .defaultStatusHandler(HttpStatusCode::is4xxClientError, response -> response
        .bodyToMono(DummyAPIError.class)
        .map(InvalidProductException::new)
        .flatMap(Mono::error))
    .build();
```

### Testing

Testing with `WebClient` is a bit more complex since there is no framework support such as `MockRestServiceServer` for `RestTemplate`.
For testing, I usually use [OkHttp's `MockWebServer`](https://github.com/square/okhttp/tree/master/mockwebserver).

A big difference between `MockWebServer` and `MockRestServiceServer` is that with `MockWebServer` you're really setting up a webserver and sending HTTP calls.
With `MockRestServiceServer` on the other hand, the calls are intercepted and never really sent out.

To use `MockWebServer`, you need to add an extra dependency, such as:

```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>mockwebserver</artifactId>
    <scope>test</scope>
</dependency>
```

After that, I usually set up my tests like this:

```java
@BeforeEach
void setUp() throws IOException {
    server = new MockWebServer();
    server.start();
    String rootUrl = server.url("/").toString();
    client = WebClient.builder().baseUrl(rootUrl).build();
}

@AfterEach
void tearDown() throws IOException {
    server.shutdown();
}
```

By starting the `MockWebServer`, you can obtain the URL and configure the `WebClient` to point to this URL.
After each test, I shut down the server.

Within a test, you can return a mock response by using the `server.enqueue()` method:

```java
Path path = Paths.get("src/test/resources/dummy-product.json");
String json = Files.readString(path);
server.enqueue(new MockResponse()
    .addHeader("Content-Type", "application/json")
    .setBody(json));
```

To write assertions based on the request, you can call `server.takeRequest()` after you made your call.
For example:

```java
RecordedRequest request = server.takeRequest();
assertThat(request.getPath()).isEqualTo("/products/1");
```

Since you have to wait until after you executed your `WebClient` call, you either have to call `block()` before calling `server.takeRequest()`, or you have to use `StepVerifier`'s `verifyComplete()` method.
For example:

```java
Path path = Paths.get("src/test/resources/dummy-product.json");
String json = Files.readString(path);
server.enqueue(new MockResponse()
    .addHeader("Content-Type", "application/json")
    .setBody(json));
StepVerifier
    // You usually put this `WebClient` method in some other class 
    // In that case, you write a test for that class
    // and then you just call the method that invokes `WebClient`
    .create(webClient
        .get()
        .uri(builder -> builder
            .pathSegment("products", "{id}")
            .build(Map.of("id", 1)))
        .retrieve()
        .bodyToMono(Product.class))
    .assertNext(product -> {
        assertThat(product.getId()).isEqualTo(1);
        // Write other assertions
    })
    .verifyComplete();
RecordedRequest request = server.takeRequest();
assertThat(request.getPath()).isEqualTo("/products/1");
```

### Using the HTTP Exchange interface

Since Spring Boot 3, there's also a new way to use `WebClient`.
To use this new method, you have to create [an interface](https://docs.spring.io/spring-framework/reference/web/webflux-http-interface-client.html) and annotate the methods with `@GetExchange`, `@PostExchange` and so on.
For example:

```java
public interface ProductWebClientExchangeClient {
    @GetExchange("/products/{id}")
    Mono<ResponseEntity<Product>> findById(@PathVariable int id);

    @PostExchange("/products/add")
    Mono<ResponseEntity<Product>> create(@RequestBody CreateProductRequest request);

    @PutExchange("/products/{id}")
    Mono<ResponseEntity<Product>> update(@PathVariable int id, @RequestBody UpdateProductRequest request);
}
```

After that, you can create an instance of the `ProductWebClientExchangeClient` interface by using the following code:

```java
@Bean
public ProductWebClientExchangeClient productWebClientExchangeClient(WebClient webClient) {
    WebClientAdapter adapter = WebClientAdapter.create(webClient);
    HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();
    return factory.createClient(ProductWebClientExchangeClient.class);
}
```

### Pros

The main advantages of `WebClient` is that it comes with a **fluent API**, that it's reactive, **non-blocking** and **asynchronous**.
In addition, it allows you to work with the HTTP exchange interface, which reduces boilerplate code even more.

### Cons

The support for `WebClient` is currently still a bit limited.
As I mentioned before, there's no testing support, so you have to rely on external libraries.

In addition, the reactive ecosystem requires additional knowledge such as how to use its operators and so on.
This usually isn't as well known as using imperative programming or functional programming with streams.

## `RestClient`

### Setup

Since Spring 6.1 and Spring Boot 3.2 (currently only available as release candidate), `RestClient` was introduced.
`RestClient` offers both the fluent API and the HTTP exchange interface from `WebClient`, but utilizes `RestTemplate` behind the screens.
This makes it the ideal candidate for synchronous REST calls. 

To use it, you can either bind it to an existing `RestTemplate` bean with `RestClient.create(restTemplate)`, or you can create a new one with:

```java
@Bean
public RestClient dummyAPIRestClient(RestClient.Builder builder) {
    return builder.baseUrl("https://dummyjson.com").build();
}
```

### Retrieving data

Retrieving data can be done with:

```java
Product product = restClient
    .get()
    .uri(uri -> uri.path("/products/1").build())
    .retrieve()
    .body(Product.class);
```

So like `WebClient`, it provides a `get()` method and a URI builder.
After that, you can use the `body()` method to map the response body to a specific type.

You can also work with URL variables just like with `RestTemplate` and `WebClient`.

If you're interested in the response headers, you can use the `toEntity()` method in stead of `body()`.

### Sending data

Sending data is similar to `WebClient`. By using the `.body()` method, you can pass a request body.
For example:

```java
CreateProductRequest request = new CreateProductRequest("Product");
ResponseEntity<Product> entity = restClient
    .post()
    .uri("/products/add")
    .body(request)
    .retrieve()
    .toEntity(Product.class);
```

### Error handling

Error handling with `RestClient` can be done in either a imperative way as with `RestTemplate`, or in a fluent way as with `WebClient`.
The fluent API for handling errors looks like this:

```java
Product product = restClient
    .get()
    .uri(uri -> uri.path("/products/1").build())
    .retrieve()
    .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
        DummyAPIError error = objectMapper.readValue(response.getBody(), DummyAPIError.class);
        throw new InvalidProductException(error);
    })
    .body(Product.class);
```

As you can see, it looks very similar to error handling with `WebClient`, but with a few exceptions.
The first difference is that the handler method accepts both a `request` and `response` parameter, while `WebClient` only accepted a `response` parameter.

The second difference is that the response class does not provide a utility method to map the response body to a class.
The `ClientHttpResponse` class only has a `getBody()` method that returns an `InputStream`.
To convert this `InputStream` to a Java object, you need to map it by yourself by autowiring `ObjectMapper` and reading the `InputStream`.

Just like with `WebClient`, you can create a default status handler within the `RestClient.Builder` as well.
For example:

```java
@Bean
public RestClient dummyAPIRestClient(RestClient.Builder builder, ObjectMapper objectMapper) {
    return builder
        .baseUrl("https://dummyjson.com")
        .defaultStatusHandler(HttpStatusCode::is4xxClientError, (request, response) -> {
            DummyAPIError error = objectMapper.readValue(response.getBody(), DummyAPIError.class);
            throw new InvalidProductException(error);
        })
        .build();
}
```

### Using the HTTP Exchange interface

Just like with `WebClient`, you can use the HTTP exchange interface with the new `RestClient`.
The major difference is that your interface methods will no longer return a `Publisher` like `Mono` or `Flux`, but an object or `ResponseEntity` directly.
For example:

```java
public interface ProductRestClientExchangeClient {
    @GetExchange("/products/{id}")
    ResponseEntity<Product> findById(@PathVariable int id);

    @PostExchange("/products/add")
    ResponseEntity<Product> create(@RequestBody CreateProductRequest request);

    @PutExchange("/products/{id}")
    ResponseEntity<Product> update(@PathVariable int id, @RequestBody UpdateProductRequest request);
}
```

Registering a bean of this interface happens in a similar way as to `WebClient`.
For example:

```java
@Bean
public ProductRestClientExchangeClient productRestClientExchangeClient(RestClient restClient) {
    RestClientAdapter adapter = RestClientAdapter.create(restClient);
    HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();
    return factory.createClient(ProductRestClientExchangeClient.class);
}
```

The major difference here is that you'll use `RestClientAdapter.create()` in stead of `WebClientAdapter.create()`.

### Pros

The advantage of using `RestClient` is that it offers similar capabilities as `WebClient`, such as a modern, **fluent API** and the ability to use the HTTP exchange interface.
This reduces boilerplate code dramatically.

In addition, since `RestClient` uses `RestTemplate` behind the screens, you can use the same interceptors, testing libraries and so on with this new `RestClient`.

### Cons

The `RestClient` is still relatively new. Currently, there's no release yet of Spring Boot that includes `RestClient`.
You can try it out already by using the 3.2 release candidate.

In addition, `RestClient` relies on blocking, synchronous traffic in stead of reactive, asynchronous traffic like `WebClient`.
The benefit of that is that synchronous flows are usually easier to understand, but the drawback is that you may encounter performance issues.

## Deprecation?

There are a few mentions on the internet that `RestTemplate` is deprecated and that it shouldn't be used.
This is **NOT** true.
This confusion exists due to earlier versions of the API docs containing a note that `RestTemplate` would be deprecated in the future ([Source](https://docs.spring.io/spring-framework/docs/5.2.2.RELEASE/javadoc-api/index.html?org/springframework/web/client/RestTemplate.html)).

However, this note has been removed from the current API docs, and now it simply mentions that `RestTemplate` is in maintenance mode.
This is because `RestTemplate` is considered feature-complete. The `RestTemplate` API does feel outdated, but **it's not deprecated** and there's **nothing wrong with using feature-complete code**!

If you do want to use a modern, fluent API, Spring does recommend using `WebClient`.
However, I'd advice against using `WebClient` if you don't plan on using reactive programming because you would be including a bunch of libraries just for that.

The next version of the API docs will include both `WebClient` and `RestClient` as modern alternatives to `RestTemplate`.

## Conclusion

Spring offers three ways of calling REST APIs through `RestTemplate`, `WebClient` and `RestClient`.
Neither of these are deprecated. if you don't know what you should choose, the following is my opinion:

Choose `RestTemplate` if:

* You're working on a project that's still on Spring Boot 1.x (ideally you should upgrade).
* Or a project that's on Spring Boot 2.x and that doesn't require reactive programming (ideally you should upgrade).
* Or you're working at a project that already uses `RestTemplate` a lot.
* Or if you don't want to work with the fluent API.

Choose `WebClient` if:

* You're working on a project that requires asynchronous or non-blocking communication.
* Or a project that already uses the reactive stack for other reasons.

Choose `RestClient` if:

* You want to use a modern and fluent API.
* And you're about to upgrade to Spring Boot 3.2 soon.

If you're interested in seeing any of these code examples, be sure to check out [GitHub](https://github.com/g00glen00b/spring-samples/tree/master/spring-boot-restclient).

