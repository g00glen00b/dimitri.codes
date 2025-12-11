---
title: "API versioning with Spring 7"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "Say goodbye to manual versioning your REST API's and hello to the new API versioning within the Spring framework."
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

One of the bigger new features of Spring Boot 4 and Spring framework 7 is that you can now configure API versioning within Spring itself.
This means you no longer need to write your own version handling, but you can rely on the framework in stead!

## Set up

Imagine the following controller:

```java
@RestController
@RequestMapping("/api/message")
public class MessageController {
    @GetMapping
    public Message getMessage() {
        return new Message("You're on version 1!");
    }

    @GetMapping(version = "1.1")
    public Message getMessage1() {
        return new Message("You're on version 1.1!");
    }

    @GetMapping(version = "1.3+")
    public Message getMessage3() {
        return new Message("You're on version 1.3 or higher!");
    }

    @GetMapping(version = "1.5")
    public Message getMessage5() {
        return new Message("You're on version 1.5!");
    }
}
```

What's new in this controller is that we have the same mapping multiple times, but each time we have a different `version` attribute (which is new).

## Resolving the version

In order to make this work, we first have to say how we're planning to pass the version to the API.
Spring supports several out-of-the-box version resolvers, such as using request headers, a path segment, a query parameter or a media type parameter.

If you're using Spring Boot, you can easily configure these by setting a property.
For example:

```properties
spring.mvc.apiversion.use.header=X-Version
spring.mvc.apiversion.use.query-parameter=version
```

In this example, I would be able to pass either the `X-Version` header or the `version` query parameter.
So yes, you can use multiple resolvers!

If you're not happy with any of the provided version resolvers, you could also write your own by creating your own bean of the [`ApiVersionResolver`](https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/web/accept/ApiVersionResolver.html) type.
To do this, all you need to do is to implement the `resolveVersion()` method which contains the `HttpServletRequest` as a parameter, and expects the version as a result.

## Supported versions

What's important to know is that Spring by default derives the versions from the controller endpoints.
Considering that my controller has mappings for version 1.1, 1.3 and 1.5, only those versions will be supported.

You likely want to extend this though. 
For example, in this example I'm using `1.3+` to indicate that any version higher than v1.3 should match.
However, version 1.4 is currently not supported because there's no explicit version mapping for it.

The same can be said for v1.0. In theory, any version below version 1.1 should be mapped to the `getMessage()` method.
However, since there's no explicit mention of v1.0 being supported, Spring won't allow it and would return a **400 Bad Request** if you tried so anyways!

To solve this, you can set the supported versions by using a property:

```properties
spring.mvc.apiversion.supported=1.0,1.1,1.2,1.3,1.4,1.5,1.6
```

This property also works in the other way.
For example, let's say you no longer want to support version 1.0 or 1.1.
In that case, you could remove them from the supported version list and in both cases you'll now get a **400 Bad Request** (even though there's an explicit mapping for version 1.1).

## Superseding versions

If we ran the application now and tried using the `X-Version: 1.0` header, the applciation would response with `"You're on version 1!"`.
This works because the `getMessage()` method does not contain any version, so it works for any version up until version 1.1.

The reason why it won't work for versions above 1.1 is because there is an explicit mapping for this version.
From that point and onwards, the `getMessage1()` method supersedes the `getMessage()` method.
This means that if you try `X-Version: 1.1`, you would get the `"You're on version 1.1!"` message.
Hwoever, if you tried `X-Version: 1.2`, you would get a **400 Bad Request**.

The same logic can be applied for the other versions as well.
Passing `X-Version: 1.3` or `X-Version: 1.4` would result in `"You're on version 1.3 or higher!"` because the `+` suffix means that any higher version would be supported.

However, if we pass `X-Version: 1.5`, then the `getMessage5()` will supersede the `getMessage3()` method.
This means that we'll get the `"You're on version 1.5!` message.
It also means that passing `X-Version: 1.6` would result in a **400 Bad Request** because neither `getMessage()` nor `getMessage3()` can be applied because they're superseded by `getMessage5()`.
It doesn't matter whether it's within the list of supported versions either!

Also useful to know is that using either `X-Version: v1.0` or `X-Version: 1.0` would result in the same outcome.
This is because Spring ignores any prefix character when parsing the version.

Also, the reason Spring behaves this way is because it assumes you're using semantic versioning by default.
If you want to use any other type of versioning, you can do so by creating a bean of type [`ApiVersionParser`](https://docs.spring.io/spring-framework/docs/current/javadoc-api//org/springframework/web/accept/ApiVersionParser.html).

The `ApiVersionParser` accepts a `String` parameter containing the version, and expects a version object as a result.
The type of this object can be anything, as long as it implements the `Comparable` interface.
The `compareTo()` method is also the part where the order of versions is determined, and thus also which version supersedes another.

## Default version

If you want to configure which vesion is being applied when no version is passed, then you can set the following property:

```properties
spring.mvc.apiversion.default=1.3
```

This would mean that if I call `/api/message` now without any `version` query parameter or `X-Version` header, it would say "`You're on version 1.3 or higher!"` because it will use version 1.3.

## Client support

API Versioning is not only implemented within the Web MVC or Webflux part, but also as part of the REST clients (either `RestClient` or `WebClient`).
The way you can configure this is by setting an `ApiVersionInserter` within the `RestClient.Builder` or `WebClient.Builder`.

For HTTP service interfaces you can use a `RestClientHttpServiceGroupConfigurer`.
For example, I defined the following client:

```java
@HttpExchange("/api/message")
public interface MessageClient {
    @GetExchange(version = "1.3")
    Message getMessage();
}
```

Then I imported it using the `@ImportHttpServices` annotation ([check my blogpost about it!](/restclient)):

```java
@SpringBootApplication
@ImportHttpServices(group = "message", value = MessageClient.class)
public class Application {
    // ...
}
```

And then finally I configured a `RestClientHttpServiceGroupConfigurer` bean like this:

```java
@Bean
RestClientHttpServiceGroupConfigurer configurer() {
    return groups -> groups
        .filterByName("message")
        .forEachClient((_, client) -> client
            .baseUrl("http://localhost:8080")
            // This is important!
            .apiVersionInserter(ApiVersionInserter.useHeader("X-Version")));
}
```

After that, Spring will know which `ApiVersionInserter` to use!
This means that if you run `MessageClient.getMessage()` you should see `"You're on version 1.3 or higher!"`.

## Conclusion

The addition of API versioning within the Spring framework makes it a lot easier to configure versioning within our REST API's and consumers.

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).

