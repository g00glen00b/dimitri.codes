---
title: "Deprecation of RestTemplate"
featuredImage: "/logos/micrometer.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "RestTemplate has been considered feature-complete for a while now, but what's the state of it in Spring Boot 4?"
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

`RestTemplate` has been considered feature-complete for a while now, especially since the release of `RestClient`.
But what's the state of `RestTemplate` in Spring Boot 4?

## The history of `RestTemplate`

`RestTemplate` has been a part of the Spring framework since v3, long before the Spring Boot era.
However, in Spring framework v5 (Spring Boot v2), the reactive stack was introduced, including a reactive REST client called `WebClient`.

This new `WebClient` sparked a lot of controversy about the state of `RestTemplate` because the [javadocs](https://www.javadoc.io/doc/org.springframework/spring-web/5.1.0.RELEASE/org/springframework/web/client/RestTemplate.html) at one point said that it would be deprecated in a future version:

> **NOTE**: As of 5.0, the non-blocking, reactive `WebClient` offers a modern alternative to the `RestTemplate` with efficient support for both sync and async, as well as streaming scenarios. **The `RestTemplate` will be deprecated in a future version** and will not have major new features added going forward.

This future deprecation notice left many people confused, because it really reads as a push towards the reactive stack.
If you don't believe me, then check [the](https://stackoverflow.com/q/77460440/1915448) - [various](https://stackoverflow.com/q/77028993/1915448) - [threads](https://stackoverflow.com/q/75701275/1915448) - [online](https://www.reddit.com/r/SpringBoot/comments/171ypbe/comment/k3tjuq2/) (there are many more).

Some people migrated to the reactive stack because they thought `RestTemplate` would disappear in favor of `WebClient`.
Alternatively, you could continue using blocking code, and use `WebClient` together with `block()` to make it synchronous again.
Personally, I didn't like either idea because switching over stacks just for one feature didn't sound great, and importing several additional libraries in order to consume REST calls didn't sound great either. 

Luckily, [the javadocs](https://www.javadoc.io/doc/org.springframework/spring-web/5.3.0/org/springframework/web/client/RestTemplate.html) were updated in a new version to only mention that it was considered feature-complete, and thus **in maintenance mode**:

> **NOTE**: As of 5.0 this class is in maintenance mode, with only minor requests for changes and bugs to be accepted going forward. Please, consider using the `WebClient` which has a more modern API and supports sync, async, and streaming scenarios.

This still left the state of consuming REST service in a weird spot, either use an outdated `RestTemplate` or switch over to the reactive stack.
That was until the release of Spring framework v6.1 (Spring Boot v3.2), which introduced the new `RestClient` class which I consider a superior and real alternative to `RestTemplate`.

[The Javadocs](https://www.javadoc.io/doc/org.springframework/spring-web/6.1.0/org/springframework/web/client/RestTemplate.html) were also updated once more to mention either `WebClient` and `RestClient` as possible alternatives:

> **NOTE**: As of 6.1, **`RestClient` offers a more modern API for synchronous HTTP access**. For asynchronous and streaming scenarios, consider the reactive `WebClient`.

That brings us to Spring framework v7 (Spring Boot v4), where `RestTemplate` is not yet deprecated, but will be in Spring framework v7.1 ([read this article](https://spring.io/blog/2025/09/30/the-state-of-http-clients-in-spring)):

> Spring Framework 7.1 (provisional date, November 2026): **formally “`@Deprecate`” the client** and mark it for removal.

## Conclusion

After a bumpy parcours, `RestTemplate` will officially be deprecated next year.
Using it in new Spring Boot v4 projects probably isn't a great idea, and you should consider switching to `RestClient` (I assume that if you switched over to the reactive stack already, you probably already use the other alternative being `WebClient`).

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).