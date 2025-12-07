---
title: "HttpSecurity customizer in Spring Boot 4"
featuredImage: "/logos/spring-security.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Spring Security", "Advent of Spring"]
excerpt: "Customizers have been added to Spring for a while now. Starting with Spring Boot 4, we can also use them to configure Spring Security's HttpSecurity bean!"
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

The feature I want to talk about today is the new way to set up your `SecurityFilterChain` bean.
People who worked with Spring Security before, probably know that setting up this bean is one of the primary things you need to do when working with Spring Security.

The way you could configure this has been improved upon over the years, and Spring Boot 4 / Spring Security 7 goes even one step further!

## Customizers

One of the biggest changes was in Spring Boot 2, where the API changed from chaining with `and()` to using a system of customizers.
One of the benefits is that you could configure certain parts to use the default way of working by using `Customizer.withDefaults()`.
This made it so you didn't have to fully configure the `SecurityFilterChain` bean.

However, once you had to override one part of the `SecurityFilterChain`, you still had to list everything that you wanted to enable.
For example, let's say you wanted to configure something in `authorizeHttpRequests()`, you would do something like:

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) {
    return http
        .authorizeHttpRequests(requests -> /* ... */)
        .formLogin(withDefaults())
        .csrf(withDefaults());
        // ...
}
```

## A new `Customizer`!

Spring Security 7 changes that by making it possible to define a `Customizer<HttpSecurity>` bean.
For example, let's say you want to use the defaults and only override the `authorizeHttpRequests()`?
Well, in that case you can create a bean like this:

```java
@Bean
Customizer<HttpSecurity> customizeAuthorizeHttpRequests() {
    return http -> http.authorizeHttpRequests(requests -> /* ... */);
}
```

## Conclusion

The new way of configuring certain beans through customizers has been expanded upon in recent years.
The benefit of using a customizer for `HttpSecurity` is that it reduces code complexity, which is something we all strive towards!

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).

