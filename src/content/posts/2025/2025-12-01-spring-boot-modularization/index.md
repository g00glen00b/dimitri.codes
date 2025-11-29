---
title: "Spring Boot's Modularization"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "Spring Boot 4 modularizes autoconfigurations, starters and its testing libraries. In this blogpost I'll tell you all about them!"
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

The first new feature I want to talk about is Spring Boot's effort towards modularization.
With Spring Boot 4, three parts of its extensive framework have been modularized:

1. The autoconfiguration
2. The Spring Boot Starters
3. The testing starters

In this blogpost, I'll show you all about them!

## Autoconfiguration

Spring Boot offers a lot of "magic".
The source behind this magic are the autoconfigurations.
These autoconfigurations are configuration classes that are automatically loaded, but have been configured to only initialize certain beans whenever certain conditions are met.
The way you can see these autoconfigurations and its conditions, is by running your application in debug mode.
For example, if you run a Spring Boot 3 project with `DEBUG=true`, you'd see the **condition evaluation report**, which would look like this:

```none

============================
CONDITIONS EVALUATION REPORT
============================


Positive matches:
-----------------

   AopAutoConfiguration matched:
      - @ConditionalOnBooleanProperty (spring.aop.auto=true) matched (OnPropertyCondition)

   AopAutoConfiguration.ClassProxyingConfiguration matched:
      - @ConditionalOnMissingClass did not find unwanted class 'org.aspectj.weaver.Advice' (OnClassCondition)
      - @ConditionalOnBooleanProperty (spring.aop.proxy-target-class=true) matched (OnPropertyCondition)
   
   ...

Negative matches:
-----------------

   ActiveMQAutoConfiguration:
      Did not match:
         - @ConditionalOnClass did not find required class 'jakarta.jms.ConnectionFactory' (OnClassCondition)
   
   ...
```

Up until Spring Boot 4, all these autoconfigurations sat within a library called  **`spring-boot-autoconfigure`**.
So regardless of whether you used Hazelcast, Cassandra or whatever other technology Spring Boot supports, those autoconfigurations were present in your project.

However, since Spring Boot 4, this is no longer the case.
Many of the autoconfiguratiosn have been moved to the many starters Spring Boot has.

The result is that the condition evaluation report within Spring Boot 4 reports a lot less autoconfigurations!
For example, a Spring Boot 3 project with `spring-boot-starter-web` included **245 autoconfigurations**.
A Spring Boot 4 with the equivalent `spring-boot-starter-webmvc` includes **91 autoconfigurations**.

This also has the consequence that some libraries that required no starter before (eg. Flyway, Liquibase, ...) now have their own Spring Boot starter.
This Spring Boot starter will contain the autoconfigurations necessary for them to work.

## Spring Boot starters

Another part that has been modularized are the Spring Boot starters.
Spring Boot always had a very extensive list of starter libraries, but in some cases they still weren't modularized enough.
For example, if you had a CLI project that had to call a REST API, then you had to include `spring-boot-starter-web`.
However, since `spring-boot-starter-web` included everything web-related, including setting up your own web server, your project would be too bloated and you had to disable certain things you didn't need.

With Spring Boot 4 on the other hand, `spring-boot-starter-web` has been deprecated. If you need a web server with Spring Web MVC, then you include `spring-boot-starter-web`.
Do you need a REST client? Then you include `spring-boot-starter-restclient`.

## Testing starters

Another thing that got modularized is `spring-boot-starter-test`.
This library used to contain many testing utilities that were useful across multiple parts of the framework.
With Spring Boot 4, these have been modularized as well.
Now there will be a testing library counterpart to many Spring Boot starters.
For example, next to `spring-boot-starter-webmvc` there will also be a `spring-boot-starter-webmvc-test`. `spring-boot-starter-restclient` will come with its own `spring-boot-starter-restclient-test` and so on.

## Conclusion

Spring Boot's modularization will make the cognitive overload when debugging autoconfigurations a lot smaller.
In addition, it will also make certain tasks a lot easier as there will be more dedicated Spring Boot starters to choose from.

For migrating, I suggest reading the [official migration guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide#starters) as this documents which starters have been deprecated and which ones have been replaced.
For new projects, I suggest starting with [Spring Initializr](https://start.spring.io/#!type=maven-project) as this will configure the starters and testing libraries you need for you.

This blogpost is a part of the [Advent of Spring Boot 2025 series](/tag/advent-of-spring).