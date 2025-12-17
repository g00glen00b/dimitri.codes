---
title: "Spring Retry became a part of Spring Core in Spring framework 7"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "Spring Retry is no more... or at least not as a separate library. Instead of that, you can now utilize retry-related functionality within Spring Core! Which functionality? That's what this blogpost is all about."
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

Today's change I'm talking about is the fact that Spring Retry is no more... or should I say, is now part of Spring Core!
This means that if you've used Spring Retry's features before, you no longer need to include the **spring-retry** library into your dependencies.
And if you didn't use Spring Retry before... then this is a great time to get started!

## What is/was Spring Retry?

Spring Retry was a separate library that is part of the Spring framework responsible for being able to retry a failing operation.
For example, let's assume an operation that can fail:

```java
@Service
public class FooService {
    private final Logger log = LoggerFactory.getLogger(getClass());

    public String getFoo() {
        var randomValue = Math.random();
        if (randomValue <= 0.2d) {
            log.info("Returned a value");
            return "foo";
        } else {
            log.info("Failed");
            throw new IllegalArgumentException("Operation failed");
        }
    }
}
```

In this example, only about 20% of the times `FooService.getFoo()` is called, an actual result is produced.
The reason why could be anything, maybe it's an external service that doesn't have the best uptime.
Sometimes you can't fix it and just retrying the operation is the best solution. In that case, Spring Retry would be your best best.
For example:

```java
@Service
public class FooService {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    // Note, this is pre-Spring Boot 4 syntax. Look ahead for the new syntax!!
    @Retryable(maxAttempts = 6, retriesFor = IllegalArgumentException.class)
    public String getFoo() {
        // ...
    }
}
```

All you had to do next was to include the `@EnableRetry` annotation to any of your configuration classes (or your main class).

If you run the application now (and you're lucky), you'll see something like this appear in the logs:

```none
Failed
Failed
Failed
Returned a value
```

## What's new

With Spring framework 7 and Spring Boot 4, you no longer have to include that separate library.
Some things were also renamed.
For example, instead of annotating your configuration with `@EnableRetry`, you should now annotate it with `@EnableResilientMethods`.
The `maxAttempts` property no longer exists, and a `maxRetries` property is included as an alternative.
The difference is that the original `maxAttempts` included the first normal attempt, while `maxRetries` only includes the retries themselves.
The `retriesFor` property also was renamed to `includes`:

```java
@Service
public class FooService {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    
    @Retryable(maxRetries = 5, includes = IllegalArgumentException.class)
    public String getFoo() {
        // ...
    }
}
```

Another change is that there's no longer a single backoff policy you have to configure, but multiple properties such as a `jitter` and `multiplier`.
For example:

```java
@Retryable(maxRetries = 5, includes = IllegalArgumentException.class, multiplier = 2)
public String getFoo() {
    // ...
}
```

By default, the `delay` is configured to be 1 second, so what would happen is that if it fails initially, it will try again in 1 second, then in 2 seconds, then in 4 seconds, in 8 seconds and finally in 16 seconds due to the `multiplier`.
If you add a `jitter`, then it won't exactly retry at 1, 2, 4, ... seconds, but add some variation.

## Programmatic setup

The annotation-driven setup with `@Retryable` is one thing, another thing that Spring offers is a programmatic approach thanks to `RetryTemplate`.
To use this, set up a `RetryTemplate` with a `RetryPolicy`.
For example:

```java
var retryPolicy = RetryPolicy
    .builder()
    .delay(Duration.ofSeconds(1))
    .multiplier(2)
    .includes(IllegalArgumentException.class)
    .jitter(Duration.ofMillis(100))
    .build();
this.retryTemplate = new RetryTemplate(retryPolicy);
```

After that, you can call `RetryTemplate.execute()` to wrap your original service call:

```java
return retryTemplate.execute(fooService::getFoo);
```

## Conclusion

Spring Retry being a part of Spring Core makes a lot of sense.
With it, people hopefully will also use it when they see fit.
Be aware though, retrying isn't always the solution.
It's not a replacement to a proper root cause analysis, neither is it a circuit breaker.

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).