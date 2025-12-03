---
title: "Support for Optional in Spring's Expression Language"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "Spring's Expression Language can do a lot of things. Starting with Spring Boot 4, it also nicely works with Optional in combination with the safe navigation and the elvis operator!"
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

To start off your weekend, here's a small Spring Boot tip of the day!
If you've been developing Spring Boot applications for a while, you've probably used the `@Value` annotation before.
Typically, this annotation is used for resolving properties such as `@Value("${my.foo.bar}")`.
However, did you know that this barely scratches the surface and that you can do much more with these?

The language that powers these expressions is called **Spring's Expression Language** or SpEL.
This expression language has been part of Spring since the beginning, and is still actively extended.
For example, starting with Spring Boot 4 and Spring Framework 7, Spring's Expression Language now has proper support for `Optional`.

## Safely unwrapping `Optional`

One of the new features is that you can now safely unwrap `Optional`.
For example, imagine we have a `ProfileService` that returns the current user their profile (eg. if you're authenticated).
Whenever the user isn't authenticated, we would return `Optional.empty()` and whenever the user is authenticated, we would return an `Optional<Profile>`.

To simplify this, I'm using `Math.random()`:

```java
@Service
public class ProfileService {
    public Optional<Profile> getCurrentUserProfile() {
        if (Math.random() < 0.5d) {
            return Optional.of(new Profile("Bob"));
        } else {
            return Optional.empty();
        }
    }
}
```

If you would like to retrieve the name of the current profile within an `@Value`, prior to Spring Boot 4 you would have to write this:

```java
@Bean
ApplicationRunner logCurrentUserProfile(@Value("#{profileService.currentUserProfile.orElse(null)?.name}") String profileName) {
    var log = LoggerFactory.getLogger(getClass());
    return _ -> log.info("Current profile name: {}", profileName);
}
```

> **Note**: most of this code is irrelevant and just to have a complete runnable example, but all you should focus on is what's inside the `@Value` annotation.
>
> To test this example, you need to run the application a few times for the `Math.random()` to work.

By using the `#{}` expression, we can refer to any bean, which is why `#{profileService}` would return the `ProfileService` bean.
To unwrap the `Optional` that's being returned from `getCurrentuserProfile()` though, we have to call `orElse(null)` and then use the **safe navigation operator** (`?`) to obtain `name` in case the object is non-null.

Starting with Spring Boot 4 however, the safe navigation operator also works with `Optional`, and thus you could simplify the above code to:

```java
@Bean
ApplicationRunner logCurrentUserProfile(@Value("#{profileService.currentUserProfile?.name}") String profileName) {
    var log = LoggerFactory.getLogger(getClass());
    return _ -> log.info("Current profile name: {}", profileName);
}
```

## Elvis operator

Another operator that has changed is the **elvis operator**.
This operator allows you to return a default value in case the left-hand expression is null-like.

For example, if we take a look at the previous example, we could use the elvis operator to return "n/a" in case the `Optional` is empty:

```java
@Bean
ApplicationRunner logCurrentUserProfile(@Value("#{profileService.currentUserProfile.orElse(null)?.name ?: 'n/a'}") String profileName) {
    var log = LoggerFactory.getLogger(getClass());
    return _ -> log.info("Current profile name: {}", profileName);
}
```

As you can see, using `Optional` was kind of a pain with versions prior to Spring Boot 4.
In this case, it would probably even be better to use the `Optional.orElse()` method and not use the elvis operator at all.

However, starting with Spring Boot 4, `Optional.empty()` is also treated as a null-like value, which means you can simplify above code to:

```java
@Bean
ApplicationRunner logCurrentUserProfile(@Value("#{profileService.currentUserProfile?.name ?: 'n/a'}") String profileName) {
    var log = LoggerFactory.getLogger(getClass());
    return _ -> log.info("Current profile name: {}", profileName);
}
```

## Conclusion

Spring's Expression Language continues to evolve. 
Starting with Spring Boot 4, it becomes a lot easier to work with `Optional` within the expression language itself!

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).