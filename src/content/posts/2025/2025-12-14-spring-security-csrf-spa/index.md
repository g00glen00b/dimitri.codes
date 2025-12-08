---
title: "Configuring CSRF for Single Page Applications with Spring Security"
featuredImage: "/logos/micrometer.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Spring Security", "Advent of Spring"]
excerpt: ""
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

Spring Security has offered CSRF protection for a while now.
However, starting with Spring framework v6.x and Spring Boot v3.x, configuring CSRF protection for Single Page Applications (SPA) such as Angular or React applications became a lot more difficult.
I even ended up talking about it my [Upgrading to Spring Boot 3 blogpost](/upgrading-spring-boot-3/#csrf-protection-against-breach-attack) and ended up asking [a question on Stack Overflow about it](https://stackoverflow.com/q/74447118/1915448) which got plenty of views and upvotes from people in a similar situation.

## The problem

Spring Security 6.x made two changes involving CSRF protection:

1. CSRF tokens were now deferred. Which meant that not every request included a CSRF token.
2. CSRF tokens were encoded with some random bytes to prevent [BREACH attacks](https://www.breachattack.com/). The cookie however did not include this encoding.

The solution to the first problem was to first invoke a GET-request to an endpoint that required the `HttpSession` to be loaded (eg. a protected API call).
The solution for the second problem however was to make a custom CSRF request handler that returned the encoded CSRF token as a cookie.
This required quite some configuration, as [demonstrated in the documentation](https://docs.spring.io/spring-security/reference/6.5/servlet/exploits/csrf.html#csrf-integration-javascript-spa).

## The new solution

Luckily, the Spring team saw this and improved this in Spring Security 7.0, which is included with Spring Boot 4.0.
Rather than having to apply some additional configuration, all you now need to do is call the `spa()` method when setting up the `SecurityFilterChain`.
For example:

```java
@Bean
Customizer<HttpSecurity> csrfSpaConfigurer() {
    return http -> http.csrf(CsrfConfigurer::spa);
}
```

> **Note**: I'm using the new `Customizer<HttpSecurity>` functionality. Read more [here](/httpsecurity-customizer).

Using the `spa()` call does two things:

1. It configures the CSRF token repository to work with cookies by using `CookieCsrfTokenRepository.withHttpOnlyFalse()`.
2. It configures the request handler to be `SpaCsrfTokenRequestHandler`, which handles the configuration I mentioned earlier for you.

## Conclusion

Configuring CSRF protection within Spring Boot v4.x applications is now back as easy as it was in Spring Boot v2.x (heck, it's probably even easier now!).

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).