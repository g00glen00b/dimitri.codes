---
title: "New JMS Client in Spring Boot 4"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "WebClient, RestClient and JdbcClient. Over the past few years, Spring has been introducing new fluent clients in stead of the older clients that relied on method overloads (RestTemplate and JdbcTemplate). Spring 7 adds a new one to this list, by introducing us the new JmsClient!"
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

Within the recent version of Spring, we've clearly seen a move towards clean fluent clients such as the `WebClient`, `RestClient` and `JdbcClient`.
Since Spring Boot 4, there's a new kid on the block called the `JmsClient`!

## Set up

Setting up the `JmsClient` is pretty easy. 
As soon as you have any JMS starter configured (eg. `spring-boot-starter-activemq`), then the `JmsClient` is automatically created for you!

After that, you can autowire it and start using it:

```java
jmsClient
    .destination(Application.TOPIC)
    .send("Hello World");
```

In theory, you can also use it to receive messages, for example:

```java
jmsClient
    .destination(Application.TOPIC)
    .receive(String.class)
    .ifPresent(message -> log.info("Message received: {}", message));
```

However, this doesn't make much sense as you don't know beforehand how many messages you want to receive.
So for receiving messages, using the `@JmsListener` annotation is probably still the best:

```java
@JmsListener(destination = Applicatin.TOPIC)
public void receiveMessage(String message) {
    log.info("Received message: {}", message);
}
```

## Conclusion

The new `JmsClient` is a clean and fluent alternative to `JmsTemplate`.
If you're using Spring Boot 4 and JMS, you should definitely check it out!

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).