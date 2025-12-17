---
title: "Liveness and readiness probes are enabled by default in Spring Boot 4"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "Spring Boot Actuator's liveness and readiness probes have been enabled by default since Spring Boot 4. What better time could there be to explore the possibilities of these probes?"
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

Ever since the launch of Spring Boot, the motto has always been to make it easy to develop production-grade applications.
One of the Spring Boot starters that makes this motto come true is **Spring Boot Actuator**.
This is because Spring Boot Actuator provides several tools (actuators) to make your job easier to keep your applications running properly in production.
You could say it's your Swiss Army knife for production!

## Health actuator

One of the things you have to do to keep your production app running is to make it easy to find out whether your application is alive and ready.
One way of doing this is to monitor the state of the health actuator.
This actuator (running at `/actuator/health`) provides a summary of all kinds of health indicators within your application.
By default, Spring already provides several health indicators, such as one to check your database connection, your disk space, etc.

You can also define your own health indicators by creating a bean of type `HealthIndicator`.
For example:

```java
@Component
public class RandomHealthIndicator implements HealthIndicator {
    @Override
    public @Nullable Health health() {
        var randomValue = Math.random();
        if (randomValue < 0.5d) {
            return Health.up().withDetail("randomValue", randomValue).build();
        } else {
            return Health.down().withDetail("randomValue", randomValue).build();
        }
    }
}
```

This is obviously not a realistic health indicator, but it shows that you can provide a status (up or down) and additional details.
One thing that's important to know is that by default Spring Boot will only show the **aggregated status of all health indicators** when you visit `/actuator/health`.
You can change this by setting the following property:

```properties
# application.properties
management.endpoint.health.show-details=always
```

This would show all details of all health indicators.
If you run the application now and visit `/actuator/health`, you'd see something like this:

```json
{
  "components": {
    "random": {
      "details": {
        "randomValue": 0.4932361037200834
      },
      "status": "UP"
    }
  },
  "status": "UP"
}
```

The name of the health indicator is derived from the bean name (`randomHealthIndicator`) and then excluding the `*HealthIndicator` suffix.

Be aware, some health indicators might expose sensitive information (such as the database vendor you're using).
If you want to avoid leaking this information, then either set the `management.endpoint.health.show-details` property to `none` (default) or `when_authorized`.


## Health groups

Since Spring Boot 2.2, the health indicators could also be grouped together.
To add a health indicator to a group, you can use the following property:

```properties
# application.properties
management.endpoint.health.group.foo.include[0]=random
```

In this example, a group called "foo" will be available that includes the `RandomHealthIndicator`.
You can check the health state of this group by visiting `/actuator/health/foo`.

The nice thing about these health groups is that you can configure their HTTP mapping separately, their authorization access requirements, etc.
For example:

```properties
# application.properties
management.endpoint.health.group.foo.show-details=when_authorized
management.endpoint.health.group.foo.roles=admin
```

## Liveness and readiness group

One use case for these groups is to determine the **liveness** and **readiness state** of an application.
The liveness and readiness state of an application are **Kubernetes concepts**, which mean the following:

1. When the liveness state is down, then there's an application issue and the application should be restarted.
2. When the readiness state is down, then there's an issue, but not necessarily within the application. The application should not be restarted in that case, but shouldn't receive traffic either.

By default, Spring only includes the `LivenessStateHealthIndicator` and `ReadinessStateHealthIndicator` into these groups.
These indicators listen to events of type [`AvailabilityChangeEvent`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/availability/AvailabilityChangeEvent.html).
These events are published whenever the application starts up (or shuts down) and are used to **gracefully start up** and **shut down** an application.

However, you can also include your own health indicators.
For example, you could add the `RandomHealthIndicator` to the liveness group like this:

```properties
# application.properties
management.endpoint.health.group.liveness.include[0]=livenessState
management.endpoint.health.group.liveness.include[1]=random
```

This can be useful to add certain things to the liveness/readiness probe such as the built-in `DiskSpaceHealthIndicator`, the `DataSourceHealthIndicator`, and so on.

## What's new?

The previously mentioned liveness and readiness groups were introduced in **Spring Boot 2.3**.
Up until now, you had to explicitly enable them by setting the following property:

```properties
# application.properties
management.health.probes.enabled=true
```

However, starting with **Spring Boot 4**, this property is **enabled by default**.

## Conclusion

Spring Boot Actuator always provided a lot of production-ready features.
One of the features that's now enabled by default is its built-in support for a liveness and readiness probe.
This could make it easier to run your Spring Boot applications in a containerized production environment such as Kubernetes!

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).