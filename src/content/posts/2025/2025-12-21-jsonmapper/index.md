---
title: "Upgrading to Jackson 3 with Spring Boot 4"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "Spring Boot 4 includes an upgrade to Jackson 3. In this blogpost I'll talk about some of the big changes in Jackson 3."
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

I've mentioned it a few times before, but whenever you upgrade your Spring Boot application to the latest Spring Boot version, you're not only upgrading the Spring framework version you use, but also countless other libraries.
One of those libraries is **Jackson**.
When you switch to Spring Boot 4, you'll see that you're no longer using Jackson v2, but the new **Jackson v3**!

## Package rename

One of the big changes within Jackson 3 is that components such as `ObjectMapper` now sit within the `tools.jackson` package and no longer in the `com.fasterxml` package.
In fact, the dependencies themselves now have a group ID starting with `tools.jackson` (e.g. `tools.jackson.core:jackson-core`).

Be aware, the annotations such as `@JsonProperty` still come from `com.fasterxml` for backwards compatibility.

## A new mapper

The biggest change (in my opinion) is that you should no longer use `ObjectMapper` directly, but use the new `JsonMapper` instead.
This new `JsonMapper` extends `ObjectMapper`, but provides a fluent, immutable API for configuring.

The new mapper is also automatically configured to map things like `Optional`, `LocalDateTime` and so on.
This means that you no longer need to work with modules such as `jackson-datatype-jsr310`.

Due to that, the new `JsonMapper` is more aligned with Spring, and thus the Spring team deprecated the `Jackson2ObjectMapperBuilder` class and recommends using the `JsonMapper.Builder` instead.
For example:

```java
@Bean
JsonMapper jsonMapper(JsonMapper.Builder builder) {
    return builder
        .enable(SerializationFeature.INDENT_OUTPUT)
        .build();
}
```

An even better solution is to use the new `JsonMapperBuilderCustomizer`, which essentially is the same as `Jackson2ObjectMapperBuilderCustomizer`, but for the new `JsonMapper`:

```java
@Bean
JsonMapperBuilderCustomizer jacksonCustomizer() {
    return builder -> builder.enable(SerializationFeature.INDENT_OUTPUT);
}
```

Another big difference is that the `JsonMapper` no longer throws checked exceptions such as `JsonProcessingException`.
Instead, it will now throw unchecked exceptions (`JacksonException`).
This makes it easier to use `JsonMapper` within lambdas, for example.

## Different feature toggles

Jackson always worked with all kinds of feature toggles (e.g. `SerializationFeature`, `MappingFeature`, ...).
Some of the defaults have also changed in Jackson 3.

For example:

- `DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES` is now `true` by default
- `SerializationFeature.WRITE_DATES_AS_TIMESTAMPS` is now `true` by default, meaning that you no longer get these Unix timestamps when serializing dates
- `MapperFeature.SORT_PROPERTIES_ALPHABETICALLY` is now `true` by default. This could impact some tests that rely on the order of JSON properties as they're now alphabetically sorted.
- ...

A full list of these changes can be found on the [wiki of Jackson](https://github.com/FasterXML/jackson/wiki/Jackson-Release-3.0).

## Conclusion

The release of Jackson 3 introduces some very logical defaults (immutability, some logical feature toggle changes, unchecked exceptions, ...).
With this, I think Jackson became even easier to use for both Spring- and non-Spring users.

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).