---
title: "Improvements to HTTP interfaces"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "Spring Boot 4 simplifies HTTP exchange interfaces, eliminating the need for manual configuration."
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

One of the big features of Spring Boot 3 was the fluent `RestClient` and the capability of defining REST clients as interfaces by using the HTTP Exchange annotations.
Spring Boot 4 extends on that by making it easier to bootstrap these HTTP interface beans.

## What is an HTTP exchange interface

The HTTP exchange interface allowed you to define REST clients like this:

```java
@HttpExchange("https://jsonplaceholder.typicode.com/posts")
public interface PostApiClient {
    @GetExchange
    List<Post> getPosts();
}
```

These interfaces still had to be initialized manually though by using a `HttpServiceProxyFactory` and binding them to either a `RestClient` or a reactive `WebClient`.

This looked something like this:

```java
@Bean
RestClient jsonPlaceholderClient(RestClient.Builder builder) {
    return builder.build();
}

@Bean
PostApiClient postApiClient(RestClient jsonPlaceholderClient) {
    var factory = HttpServiceProxyFactory
        .builder()
        .exchangeAdapter(RestClientAdapter.create(jsonPlaceholderClient))
        .build();
    return factory.createClient(PostApiClient.class);
}
```

## Improvements

With Spring Boot 4 on the other hand, we now get a convenient `@ImportHttpServices` annotation.
With this annotation, we can simply include the interfaces we want to create beans for, and that's it!

For example:

```java
@Configuration
@ImportHttpServices(PostApiClient.class)
class RestClientConfiguration {
    
}
```

You might think, but what if I configured the base URL in my `RestClient` itself?
Well, no worries. You can also define HTTP interface groups:

```java
@Configuration
@ImportHttpServices(groups = "jsonplaceholder", types = {PostApiClient.class, CommentApiClient.class})
class RestClientConfiguration {
    
}
```

And now you can configure the base URL of this `"jsonplaceholder"` group by setting the following property:

```properties
spring.http.serviceclient.jsonplaceholder.base-url=https://jsonplaceholder.typicode.com
```

In case you need more advanced control over your `RestClient`, you can also programmatically configure the `RestClient.Builder` by defining a `RestClientHttpServiceGroupConfigurer`:

```java
@Bean
RestClientHttpServiceGroupConfigurer groupConfigurer() {
    return groups -> {
        groups
            .filterByName("jsonplaceholder")
            .forEachClient((_, builder) ->
                builder.baseUrl("https://jsonplaceholder.typicode.com"));
    };
}
```

## Conclusion

Spring Boot's improvements to the HTTP exchange interfaces turn it into a very handy feature that makes me wonder how we survived this long without!

This blogpost is a part of the [Advent of Spring Boot 2025 series](/tag/advent-of-spring).
