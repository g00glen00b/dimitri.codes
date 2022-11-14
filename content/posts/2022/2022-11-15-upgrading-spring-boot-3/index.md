---
title: "Upgrading to Spring Boot 3"
featuredImage: "../../../images/logos/spring-boot.png"
categories: ["Tutorials"]
tags: ["Spring", "Spring boot"]
excerpt: "I recently upgraded my project to Spring Boot 3.0, here's my experience with it"
---

I recently upgraded my [latest project](https://github.com/g00glen00b/medication-assistant) to Spring Boot 3.0 (RC1).
In this tutorial I will cover the changes I made to my application.

## Contents

1. [General changes](#general-changes)
   1. [Upgrade to Java 17](#upgrade-to-java-17)
   2. [Upgrade to Jakarta EE 9](#upgrade-to-jakarta-ee-9)
   3. [Changes in application properties processing](#changes-in-application-properties-processing)
2. [Changes to Spring Web](#changes-to-spring-web)
   1. [Removal of `AntPathMatcher`](#removal-of-antpathmatcher)
3. [Changes to Spring Security](#changes-to-spring-security)
   1. [Removal of `WebSecurityConfigurerAdapter`](#removal-of-websecurityconfigureradapter)
   2. [Use `requestMatchers`  instead of `antMatchers](#use-requestmatchers-in-stead-of-antmatchers)
   3. [Use `@EnableMethodSecurity` in stead of `@EnableGlobalMethodSecurity`](#use-enablemethodsecurity-in-stead-of-enableglobalmethodsecurity)
4. [Changes to Spring Batch](#changes-to-spring-batch)
   1. [Deprecation of factories](#deprecation-of-factories)
   2. [Changes in `chunk()` builder](#changes-in-chunk-builder)
   3. [Changes in `ItemWriter`](#changes-in-itemwriter)
5. [Conclusion](#conclusion)

## General changes

### Upgrade to Java 17

Spring Boot 3 and Spring Framework 6 will require Java 17 as the new baseline version.
This means that if you were using an older version of Java, you may run into some difficulties.

### Upgrade to Jakarta EE 9

In addition to Java 17, Spring Boot 3 and Spring Framework 6 will move to Jakarta EE 9.
The change to Jakarta EE 9 means that you have to replace most imports to `javax.*` by `jakarta.*`. For example:

- `javax.persistence.*` becomes `jakarta.persistence.*`
- `javax.servlet.*` becomes `jakarta.servlet.*`
- `javax.validation.*` becomes `jakarta.validation.*`

This has an impact on bean validation, servlet filters, entities, ... .

### Changes in application properties processing

Since Spring Boot 2.4, there have been some changes in the way application properties were loaded ([see more information](https://spring.io/blog/2020/08/14/config-file-processing-in-spring-boot-2-4)).
Until now, you could restore the original behaviour by setting the `spring.config.use-legacy-processing` application property to `true`.

This behaviour has been removed with Spring Boot 3.0, which means you need to switch to the new processing behaviour.

## Changes to Spring Web

### Removal of `AntPathMatcher`

If you're using patterns in your controllers (eg. `/**`), you may have noticed that this didn't always work since Spring Boot 2.6.
Back in Spring Boot 2.6 a different pattern parser was implemented, which had a few extra restrictions.

In Spring Boot 2.6 and higher, it was still possible to revert to the original implementation by setting the `spring.mvc.pathmatch.matching-strategy` property.
Starting with Spring Boot 3.0, this is no longer possible. 
If you have an advanced pattern that's no longer allowed, it's recommended to use a different approach (eg. by implementing your own `Filter`).

For example, in one of my applications I used the following configuration:

```java
@Override
public void addViewControllers(ViewControllerRegistry registry) {
    registry.addViewController("/{x:^(?!api$).*$}/**/{y:[\\w\\-]+}").setViewName("forward:/index.html");
}
```

This is no longer allowed because nothing can be put after the `/**`. 
To fix this I wrote a dedicated `Filter` that does the forwarding.

## Changes to Spring Security

### Removal of `WebSecurityConfigurerAdapter`

If you used a recent version of Spring Boot 2.x, you probably already noticed the deprecation warnings in your security-related configuration.
With Spring Boot 3, many of these deprecated classes were removed. One of these is the `WebSecurityConfigurerAdapter`.

Rather than extending from `WebSecurityConfigurerAdapter`, you now create a bean and autowire `HttpSecurity` into it.
For example:

```java
// Since Spring Boot 2.x
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    // @formatter:off
    return http
        .authorizeHttpRequests()
            .antMatchers("/api/**").authenticated()
        .build();
    // @formatter:on
}
```

### Use `requestMatchers` in stead of `antMatchers`

Also new in Spring Boot 3 is that you can no longer use the `antMatchers()` method, but in stead you have to use the `requestMatchers` method of the `HttpSecurity` configuration.

For example:

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    // @formatter:off
    return http
        .authorizeHttpRequests()
            .requestMatchers("/api/**").authenticated()
        .build();
    // @formatter:on
}
```

By the way, if you don't like using all those `and()` calls in your security configuration, you can also use customizers for a while now:

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    // @formatter:off
    return http
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers("/api/**").authenticated())
        .httpBasic(httpBasic -> httpBasic
            .authenticationEntryPoint(new FormBasedBasicAuthenticationEntryPoint()))
        .build();
    // @formatter:on
}
```

### Use `@EnableMethodSecurity` in stead of `@EnableGlobalMethodSecurity`

If you're using annotations like `@PreAuthorize`, you had to enable method security by adding the following annotation:

```java
// Pre Spring Boot 3.0.0
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {
    // ...
}
```

This annotation is removed and now you have to use the `@EnableMethodSecurity` annotation.
Also good to know is that the default of `prePostEnabled` is now `true`, so you only need to write the annotation itself now:

```java
@Configuration
@EnableMethodSecurity
public class SecurityConfiguration {
    // ...
}
```

## Changes to Spring Batch

### Deprecation of factories

If you're using Spring Batch, you often use classes like `StepBuilderFactory` and `JobBuilderFactory`.
For example:

```java
// Pre Spring Boot 3.0
@Bean
public Job notificationJob(JobBuilderFactory jobs) {
    return jobs
        .get("epxiryNotificationJob")
        .start(soonExpiredNotificationStep())
        .next(todayExpiredNotificationStep())
        .next(soonNoQuantityNotificationStep())
        .next(noQuantityNotificationStep())
        .build();
}

@Bean
public Step todayExpiredNotificationStep(StepBuilderFactory steps) {
    return steps
        .get("todayExpiredNotificationStep")
        .reader(new MedicationAvailabilityExpiryReader(clock, Period.ZERO, repository, properties.chunkSize()))
        .writer(new MedicationAvailabilityNotificationWriter<>(notificationService::createExpired))
        .build();
}
```

These classes are now deprecated and can be replaced by `StepBuilder` and `JobBuilder`.
The new builders no longer have to be autowired, but can be instantiated with `new StepBuilder(..)`.
One major difference to these new builders is that you have to provide the `JobRepository` as an argument:

```java
@Bean
public Job notificationJob(JobRepository jobRepository) {
    return new JobBuilder("epxiryNotificationJob", jobRepository)
        .start(soonExpiredNotificationStep())
        .next(todayExpiredNotificationStep())
        .next(soonNoQuantityNotificationStep())
        .next(noQuantityNotificationStep())
        .build();
}

@Bean
public Step todayExpiredNotificationStep(JobRepository jobRepository) {
    return new StepBuilder("todayExpiredNotificationStep", jobRepository)
        .reader(new MedicationAvailabilityExpiryReader(clock, Period.ZERO, repository, properties.chunkSize()))
        .writer(new MedicationAvailabilityNotificationWriter<>(notificationService::createExpired))
        .build();
}
```

### Changes in `chunk()` builder

If you have a step that requires chunking, you usually used the `chunk()` method of the `StepBuilder`.
This method required a single argument containing the number of elements that one chunk should contain.

This method is now deprecated because you now also have to provide the `PlatformTransactionManager`. For example:

```java
@Bean
public Step todayExpiredNotificationStep(JobRepository jobReposiotry, PlatformTransactionManager transactionManager) {
    return new StepBuilder("todayExpiredNotificationStep", jobRepository)
        // Pass transactionManager
        .<MedicationAvailabilityEntity, MedicationAvailabilityEntity>chunk(properties.chunkSize(), transactionManager)
        .reader(new MedicationAvailabilityExpiryReader(clock, Period.ZERO, repository, properties.chunkSize()))
        .writer(new MedicationAvailabilityNotificationWriter<>(notificationService::createExpired))
        .build();
}
```

### Changes in `ItemWriter`

The interface of `ItemWriter` also slightly changed. 
In previous versions, this interface declared one `write()` method that had one argument containing a collection of items.

With Spring Boot 3, this is now replaced by the `Chunk` class. This new class extends from `Iterable`, so other than changing the method signature you don't have to change anything.
However, this class provides some extra information such as `getSkips()`, `getErrors()` and so on.

```java
@RequiredArgsConstructor
public class MedicationAvailabilityNotificationWriter<T> implements ItemWriter<T> {
    private final Function<T, NotificationDTO> notificationFactory;

    @Override
    public void write(Chunk<? extends T> list) {
        list.forEach(notificationFactory::apply);
    }
}
```

## Conclusion

If your project is already on Spring Boot 2.7 and Java 17 and you're not using deprecated or legacy features, the upgrade to Spring Boot 3.0 should be fairly simple.
In that case, the major difference is to rename all imports, which can be done with a global find-and-replace.

The only two API changes I encountered were the change in Spring Batch's `ItemWriter` and Spring Security's `antMatcher`.
The complete changes can be found in [this commit](https://github.com/g00glen00b/medication-assistant/commit/88a8e0d8b182e7629fd2de1ebbb9946bd288168a).
Sidenote: I also replaced the Moduliths library by the new experimental Spring Modulith library (later more about that).
