---
title: "Streaming your request and response bodies with Spring's HTTP interfaces"
featuredImage: "/logos/spring-security.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "If you're handling large request or response bodies, streaming them could be useful. Starting with Spring Boot 4, using InputStream and OutputStream is now directly supported within the HTTP interface clients."
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

Spring Boot 4 introduced us to several new features, several of them improving the **HTTP service interfaces**.
Things I covered so far were the possibility to [easily configure them](/restclient) and the fact that you can [easily integrate OAuth2](/http-interface-oauth).

Another new feature that was added is that these HTTP interfaces now also support the use of `InputStream` and `OutputStream` formats.
This allows you to easily stream responses, which could be useful for sending over large data without having to keep it all in memory.

## Example

[Last time](/http-interface-oauth), I set up an HTTP interface client for GitHub.
The implementation we had looked like this:

```java
@ClientRegistrationId("github")
@HttpExchange("/user")
public interface UserClient {
    @GetExchange("/repos")
    List<GitHubRepository> getRepositories(@RequestParam String type);
}
```

In stead of returning a `List<GitHubRepository>`, we could also return an `InputStream`.
For example:

```java
@ClientRegistrationId("github")
@HttpExchange("/user")
public interface UserClient {
    @GetExchange("/repos")
    List<GitHubRepository> getRepositories(@RequestParam String type);

    @GetExchange("/repos")
    InputStream getRepositoriesInputStream(@RequestParam String type);
}
```

After that, we could write some code to copy the `InputStream` to a file. For example:

```java
Files.copy(
    userClient.getRepositoriesInputStream("private"),
    Path.of("./response.json"),
    StandardCopyOption.REPLACE_EXISTING);
```

The result will be that once you run this code, a file called `response.json` will appear in your project directory.
In this case, it isn't very useful. However imagine that you're retrieving a very large JSON response body, or a very large file in general.
Is it a good idea to deserialize the JSON response to an object if you just need to store the response?
Or better, is it a good idea to keep a large response in memory? The answer is probably "no", which is why streaming your response with an `InputStream` could be very useful!

Similarly, you can pass an `OutputStream` as the request body of an HTTP interface, which would allow you to stream large files as part of the request.

## Conclusion

Streaming your request and response bodies can be useful in certain scenarios.
Doing that required you to use either `RestClient` or `WebClient` directly, as it wasn't possible through HTTP interfaces.
Luckily, Spring framework 7 and thus Spring Boot 4 changed that, and now allow you to use `InputStream` for response bodies and `OutputStream` for request bodies.

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).