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
Whenever the user isn't authenticated, we would return `null` and whenever the user is authenticated, we would return a `Profile`.

To simplify this, I'm using `Math.random()`:

```java
@Service
public class ProfileService {
    @Nullable
    public Profile getCurrentUserProfile() {
        if (Math.random() < 0.5d) {
            return new Profile("Bob");
        } else {
            return null;
        }
    }
}
```

If you would like to retrieve the name of the current profile within a `@Value`, you could do something like this:

```java
@Bean
ApplicationRunner logCurrentUserProfile(@Value("#{profileService.currentUserProfile?.name}") String profileName) {
    var log = LoggerFactory.getLogger(getClass());
    return _ -> log.info("Current profile name: {}", profileName);
}
```

> **Note**: most of this code is irrelevant and just to have a complete runnable example, but all you should focus on is what's inside the `@Value` annotation.
>
> To test this example, you need to run the application a few times for the `Math.random()` to work.

By using the `#{}` expression, we can refer to any bean, which is why `#{profileService}` would return the `ProfileService` bean.
However, our `ProfileService.getCurrentUserProfile()` should ideally work with `Optional<Profile>`, so we could refactor it like this:

```java
public Optional<Profile> getCurrentUserProfile() {
    if (Math.random() < 0.5d) {
        return Optional.of(new Profile("Bob"));
    } else {
        return Optional.empty();
    }
}
```

Sadly, the unwrapping of `Optional` wasn't possible prior to Spring Boot 4. 
So in Spring Boot 3.x and before, you had to first turn the `Optional` into a nullable value, which results in ugly code like this where we use the `orElse(null)` method:

```java
@Bean
// <= Spring Boot 3.x
ApplicationRunner logCurrentUserProfile(@Value("#{profileService.currentUserProfile.orElse(null)?.name}") String profileName) {
    var log = LoggerFactory.getLogger(getClass());
    return _ -> log.info("Current profile name: {}", profileName);
}
```

Starting with Spring Boot 4 however, the safe navigation operator also works with `Optional`, and thus you could use the same code as we did for the nullable example:

```java
// >= Spring Boot 4.x
@Bean
ApplicationRunner logCurrentUserProfile(@Value("#{profileService.currentUserProfile?.name}") String profileName) {
    var log = LoggerFactory.getLogger(getClass());
    return _ -> log.info("Current profile name: {}", profileName);
}
```

## Elvis operator

Another operator that has changed is the **elvis operator**.
This operator allows you to return a default value in case the left-hand expression is null-like.

Just like before, if our example returned a `Profile` or `null`, we could write something like this:

```java
@Bean
ApplicationRunner logCurrentUserProfile(@Value("#{profileService.currentUserProfile?.name ?: 'n/a'}") String profileName) {
    var log = LoggerFactory.getLogger(getClass());
    return _ -> log.info("Current profile name: {}", profileName);
}
```

But again, this wasn't possible with `Optional`. So just like last time, we had to use `orElse(null)` in Spring Boot 3.x and before:

```java
// <= Spring Boot 3.x
@Bean
ApplicationRunner logCurrentUserProfile(@Value("#{profileService.currentUserProfile.orElse(null)?.name ?: 'n/a'}") String profileName) {
    var log = LoggerFactory.getLogger(getClass());
    return _ -> log.info("Current profile name: {}", profileName);
}
```

As you can see, handling `Optional` was kind of a pain prior to Spring Boot 4.
In this case, it probably would be better not to use the Elvis operator at all.

Starting with Spring Boot 4, we can do the same thing as with nullable values:

```java
// >= Spring Boot 4.x
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