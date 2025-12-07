---
title: "Simplification of the Spring Batch API"
featuredImage: "/logos/spring-batch.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Spring Batch", "Advent of Spring"]
excerpt: "Spring Batch not only became modularized, but also simplified its API. API's like JobExplorer and JobOperator now got merged into other API's, simplifying your applications!"
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

A few days ago, I talked about the [modularization of Spring Batch](/modularization-spring-batch).
This wasn't the only change in Spring Batch though! Some of its API components have been simplified, and I'll go over them!

## `JobRepository` vs `JobExplorer`

Whenever you use Spring Batch, you somehow have to keep track of which job instance is running and what is its execution state.
To do this, Spring Batch provided a `JobRepository` to store the job instance information.

To retrieve the job instance information on the other hand, you would typically use the `JobExplorer` interface.
This didn't support storing the metadata, but provided a readonly view of the information stored within `JobRepository`.

```java
// An example of the JobExplorer API
var jobInstances = jobExplorer.getJobInstances(jobName, 0, 10);
var jobExecutions = jobExplorer.getJobExecutions(jobInstances.getFirst());
var isRunning = jobExecutions.getFirst().isRunning();
```

Starting with Spring Boot 4 and Spring Batch 6, `JobRepository` now extends the `JobExplorer` interface.
This means you now only ever need to autowire `JobRepository`, and you can call the same methods that you used to execute on `JobExplorer`.

```java
// Works since Spring Boot 4
var jobInstances = jobRepository.getJobInstances(jobName, 0, 10);
var jobExecutions = jobRepository.getJobExecutions(jobInstances.getFirst());
var isRunning = jobExecutions.getFirst().isRunning();
```

## `JobOperator` vs `JobLauncher`

If you try to launch a Spring Batch job, you typically use the `JobLauncher` interface.
Stopping a job on the other hand happened typically with the `JobOperator` interface.

```java
// Prior to Spring Boot 4
jobLauncher.run(job, jobParameters);
var jobExecutions = jobExplorer.findRunningJobExecutions(jobName);
jobExplorer.stop(jobExecutions.getFirst().getId());
```

To simplify this, `JobOperator` now extends the `JobLauncher` interface.
This means you now have a single interface you can use to both start and stop Spring Batch jobs.

```java
// Starting with Spring Boot 4
jobOperator.run(job, jobParameters);
var jobExecutions = jobRepository.findRunningJobExecutions(jobName);
jobOperator.stop(jobExecutions.getFirst().getId());
```

## Conclusion

Spring Batch combined some API's that had a high cohesion (storing + retrieving metadata and starting + stopping jobs).
Instead of using four different components, you now only need two. 
This results in easier to follow code, and thus less complexity!

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).