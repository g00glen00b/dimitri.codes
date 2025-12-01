---
title: "Modularization of Spring Batch"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "Spring Boot 4 introduces a new default for Spring Batch, no longer requiring any database table. In this blogpost I'll talk more about the impact this has on your code."
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

A few days ago, I talked about the [modularization of Spring Boot](./spring-boot-modularization).
This changed several things within Spring Boot, including within Spring Batch.

## Two starters in stead of one

Originally, Spring Batch had just a single Spring Boot starter called `spring-boot-starter-batch`.
By default, this persisted the batch state within database tables.

However, since Spring Boot 3.4 (Spring Batch 5.2), a new `ResourcelessJobRepository` has been introduced.
This job repository doesn't require any database tables (or in memory database) to work.

Starting with Spring Boot 4 (Spring Batch 6), this `ResourcelessJobRepository` is the default implementation of `JobRepository` when you include `spring-boot-starter-batch`.
If you want to go back to the original behaviour by storing metadata inside a database table, then you should work with the new `spring-boot-starter-batch-jdbc` starter.

## Impact on testing

If you've tested Spring Batch applications before, you likely came into contact with `JobRepositoryTestUtils`.
This testing utility lets you clear existing metadata from the Spring Batch tables, making it so you can start with a clean slate within each test without having to restart your application.
For example:

```java
@Autowired
private JobRepositoryTestUtils jobRepositoryTestUtils;

@BeforeEach
void setUp() {
    jobRepositoryTestUtils.removeJobExecutions();
}
```

However, this approach **does not work** with `ResourcelessJobRepository`.
This is because under the hood, `JobRepositoryTestUtils` calls `JobRepository.deleteJobExecution()`, but this method has not been implemented within `ResourcelessJobRepository`.
Instead, this throws an `UnsupportedOperationException`.

So far, the only workaround I've found is to completely restart the application by adding the `@DirtiesContext` annotation to each test.
For example:

```java
@DirtiesContext
@Test
void testJobLaunch() {
    // ...
}
```

In addition to what I've mentioned before, there are now also two testing libraries called `spring-boot-starter-batch-test` and `spring-boot-starter-batch-jdbc-test`.
Pick the one matching the starting library you chose.

## Conclusion

Spring Batch now uses a resourceless job repository by default. This behavior can be overriden by using the new `spring-boot-starter-batch-jdbc` starter.
Also be aware that your testing approach might change if you work with `ResourcelessJobRepository`.

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).