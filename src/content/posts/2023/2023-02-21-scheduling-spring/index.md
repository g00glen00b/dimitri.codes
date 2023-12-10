---
title: "Scheduling tasks with Spring"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot"]
excerpt: "With Spring, there are several options to automatically schedule tasks. In this tutorial I'll explain them."
---

## Setup

Scheduling tasks with Spring is a core feature within the Spring framework.
This means that you don't have to add any additional dependencies (except spring-core itself).

You do have to enable this feature though.
To do this, add the `@EnableScheduling` annotation to any configuration class.
For example, you could add it to the main application class:

```java
@EnableScheduling // Add this
@SpringBootApplication
public class MySpringBootApplication {

    public static void main(String[] args) {
        SpringApplication.run(MySpringBootApplication.class, args);
    }

}
```

## Using `@Scheduled`

The most common way to add scheduling to your application is by using the `@Scheduled` annotation.
This annotation has a few properties you can configure to enable scheduling.

### Using `fixedRate`

The `fixedRate` property allows you to configure an amount of milliseconds in between the start of each run.
For example:

```java
@Scheduled(fixedRate = 3600000)
public void method() {
    // TODO: Implement
}
```

In this case, the method will be invoked every hour, beginning an hour after the application was started.

### Using `fixedDelay`

The `fixedDelay` property is similar to the `fixedRate` property as it allows you to provide a time in milliseconds.
The difference between `fixedRate` and `fixedDelay` is that `fixedDelay` is the time calculated between the end of the previous run and the start of the next run.

```java
@Scheduled(fixedDelay = 3600000)
public void method() {
    // TODO: Implement
}
```

For example, let's say you start your application at 00:00 midnight and your job takes exactly 5 minutes to run.
With `fixedRate`, the job would run at 01:00, 02:00, ... while with `fixedDelay` the job would run at 01:00, 02:05, 03:10, ... .

### Using `cron`

The last option within the `@Scheduled` annotation is the `cron` property.
This allows you to define a schedule as a [cron expression](https://crontab.guru/). 
One important difference between crontab and the Spring cron expressions is that the latter also contains a field for seconds.

Some examples:

- To run a job every 30 seconds, you can use `*/30 * * * * *`.
- To run a job every hour, you can use `0 0 * * * *`.
- To run a job every night you can use `0 0 0 * * *`.

Spring also supports some macros such as `@yearly`, `@monthly`, `@weekly`, `@daily` and `@hourly`.
More information can be found in [the API docs of the `CronExpression` class](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/support/CronExpression.html).

So if we want to replace our earlier example to run a method every hour, we could write:

```java
@Scheduled(cron = "0 0 * * * *")
public void method() {
    // TODO: Implement
}
```

### Setting an initial delay

Both `fixedRate` and `fixedDelay` only start X amount of time after you start the application.
If you want to change this behaviour, you can configure an initial delay.

To do this, add the `initialDelay` property. 
For example, let's say we want to run our method on startup and every hour after that, we could write:

```java
@Scheduled(fixedRate = 3600000, initialDelay = 0)
public void method() {
    // TODO: Implement
}
```

**Beware**: The `cron` property does not support the `initialDelay` as these expressions are time-based and not relative towards when you started the application.

### Using Spring's Expression Language (SpEL)

Another nice feature is that you can use Spring's Expression Language within the different properties of the `@Scheduled` annotation.
To do this, you need to replace `fixedRate`, `fixedDelay` and `initialDelay` with `fixedRateString`, `fixedDelayString` and `initialDelayString`.

For example, if you want to get the `fixedRate` property from a bean property, you can use:

```java
@Scheduled(fixedRateString = "#{@myBean.property}")
public void method() {
    // TODO: Implement
}
```

Spring's Expression Language is also supported for the `cron` property.
Since this property already expects a string, you don't need to use a different property:

```java
@Scheduled(cron = "#{@myBean.property}")
public void method() {
    // TODO: Implement
}
```

## Using `TaskScheduler`

Another alternative to the `@Scheduled` annotation is to use the `TaskScheduler`.
Autowire this class and call any of its methods such as `scheduleWithFixedDelay()` or `scheduleWithFixedRate()`.

For example:

```java
@Bean
public ScheduledFuture<?> schedule(TaskScheduler scheduler) {
    return scheduler.scheduleWithFixedRate(() -> {
        // TODO: Implement
    }, Duration.ofHours(1));    
}
```

The benefits of this approach are:

1. You can write the schedule logic programmatically.
2. You can work with the `Duration` class from the Java Time API, so you no longer have to calculate the delay in milliseconds.

The `TaskScheduler` also supports cron expressions by using the `CronTrigger` class:

```java
@Bean
public ScheduledFuture<?> schedule(TaskScheduler scheduler) {
    Trigger hourlyTrigger = new CronTrigger("0 0 * * * *");
    return scheduler.schedule(() -> {
        // TODO: Implement
    }, hourlyTrigger);
}
```

## Using application properties for scheduling

A question I see often is how you can configure the delay within your application properties.
There are a few ways you can implement this.

First of all, we have to create a class using `@ConfigurationProperties`:

```java
@ConfigurationProperties(prefix = "app")
public record AppProperties(Duration duration) {
    
}
```

The benefit of using `@ConfigurationProperties` is that it allows some nice conversions.
For example, you can define the duration using:

```properties
app.duration=1h
```

Now we have to register these properties by adding the `@EnableConfigurationProperties` annotation to any configuration class or the main class:

```java
@EnableConfigurationProperties(AppProperties.class) // Add this
@EnableScheduling // We added this before
@SpringBootApplication
public class MySpringBootApplication {

    public static void main(String[] args) {
        SpringApplication.run(MySpringBootApplication.class, args);
    }

}
```

Now we have two options to schedule:

1. We can use Spring's Expression Language (SpEL) in combination with `@Scheduled`,
2. Or we can use the `TaskScheduler` we mentioned before.

### Option 1: Using `@Scheduled`

Since the `AppProperties` will be configured as a bean, you can now access the `duration` property using Spring's Expression Language.
The name of the bean is the fully qualified name of the properties class, including the package.

This means you can write something like this:

```java
@Scheduled(fixedRateString = "#{@'com.xyz.my.pkg.AppProperties'.duration().toMillis()}")
public void method() {
    // TODO: Implement
}
```

The reason why we're using these single quotes is to escape the dots in the package name.
If we didn't do this, Spring would look for a bean called `com` and call the `xyz` property on that bean.

Since `fixedRateString` expects the time in milliseconds, we call the `toMillis()` method of the `Duration` class which converts it for us.

### Option 2: Using `TaskScheduler`

With `TaskScheduler`, we create a new bean and autowire `TaskScheduler` and `AppProperties` into our bean definition method:

```java
@Bean
public ScheduledFuture<?> schedule(TaskScheduler scheduler, AppProperties properties) {
    return scheduler.scheduleWithFixedRate(() -> {
        // TODO: Implement
    }, properties.duration());
}
```

Personally, I like this approach because:

1. We don't have to write code in a string like with Spring's Expression Language.
2. We don't have to include the whole package name in a string either.
3. The `TaskScheduler` natively supports `Duration`, and thus we don't have to call the `toMillis()` method.

## Conclusion

Summarized, you can schedule tasks with both the `@Scheduled` annotation and the `TaskScheduler` class.
Both allow you to define your trigger as a fixed delay, a fixed rate or a cron expression.
They also allow you to customize it programmatically, either by using Spring's Epxression Language for the `@Scheduled` annotation or programmatically by using the `TaskScheduler` class.