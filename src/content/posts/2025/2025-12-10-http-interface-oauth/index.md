---
title: "OAuth2 Client support for HTTP interfaces"
featuredImage: "/logos/spring-security.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Spring Security", "Advent of Spring"]
excerpt: "Spring Boot 4 improved their HTTP interfaces. One of the newly added features is that you can easily link them to a Spring Security OAuth2 Client."
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

Spring Boot 4 included several improvements to HTTP interfaces. I already mentioned that there's now an [easy way to set up these interfaces](/restclient), but that's not all!
Starting with Spring Security 7 (included in Spring Boot 4), there's now also builtin support to link them to an OAuth2 client!

## OAuth2 Client

OAuth2 Clients have been a part of Spring Security for a while, and can be included with the following starter:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security-oauth2-client</artifactId>
</dependency>
```

After that, you can configure the OAuth2 client through the `spring.security.oauth2.client.registration.*` and `spring.security.oauth2.client.provider.*` properties.
For example, I've set up an example using the [GitHub API](https://docs.github.com/en/rest?apiVersion=2022-11-28) and it looks like this:

```properties
# GitHub OAuth2 Client Registration
spring.security.oauth2.client.registration.github.client-id=${CLIENT_ID}
spring.security.oauth2.client.registration.github.client-secret=${CLIENT_SECRET}
spring.security.oauth2.client.registration.github.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.github.scope[0]=read:user
spring.security.oauth2.client.registration.github.scope[1]=user:email
spring.security.oauth2.client.registration.github.scope[2]=repo

# GitHub OAuth2 Provider Configuration
spring.security.oauth2.client.provider.github.authorization-uri=https://github.com/login/oauth/authorize
spring.security.oauth2.client.provider.github.token-uri=https://github.com/login/oauth/access_token
spring.security.oauth2.client.provider.github.user-info-uri=https://api.github.com/user
spring.security.oauth2.client.provider.github.user-name-attribute=login
```

> **Note**: If you're planning on doing the same thing, you also need to register a **GitHub OAUth2 Application** and generate a client secret.
> The client ID and client secret should be configured as `CLIENT_ID` and `CLIENT_SECRET` environment variables.
>
> Also don't forget to set the redirect URL of the GitHub OAuth2 Application to be `http://localhost:8080/login/oauth2/code/github`.

Now all you need to do is to configure Spring Security to require an OAuth2 login:

```java
@Bean
Customizer<HttpSecurity> httpSecurityCustomizer() {
    return http -> http
        .oauth2Login(oauth2 -> oauth2
            .defaultSuccessUrl("/", true));
}
```

> **Note**: I'm using the new `HttpSecurity` customizer which [I covered yesterday](/httpsecurity-customizer)!

Once you do that and you open your application, you should now be redirected to GitHub, where you can give access to your GitHub profile, after which you should be redirected back.

## HTTP interface

The nice thing is that you can now easily link this Spring Security OAuth2 client registration to an HTTP interface.
Before we can do that, we need to create the HTTP interface first though!

For example, let's say we want to retrieve the private repositories of the currently authenticated user.
In that case, we can define an HTTP interface like this:

```java
// UserClient.java
@HttpExchange("/user")
public interface UserClient {
    @GetExchange("/repos")
    List<GitHubRepository> getRepositories(@RequestParam String type);
}

// GitHubRepository.java
public record GitHubRepository(int id, String name) {
}
```

To set up the HTTP interface, we can use the new `@ImportHttpServices` annotation:

```java
// Add @ImportHttpServices to any configuration class
@ImportHttpServices(group = "github", types = UserClient.class)
@SpringBootApplication
public class Application {

    static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

And then we can configure the base URL using properties:

```properties
# application.properties
# GitHub HTTPInterface Configuration
spring.http.serviceclient.github.base-url=https://api.github.com
```

> **Note**: I mention this and more in my recent [Improvements to HTTP interfaces](/restclient) blogpost.

## Using an OAuth2 client in an HTTP interface

To enable linking OAuth2 clients to HTTP interfaces, you first need to register a bean depending on the type of REST client backend (`RestClient` or `WebClient`) you want to use.
In this example I'm using `RestClient`, so I'm creating an `OAuth2RestClientHttpServiceGroupConfigurer` bean:

```java
@Bean
OAuth2RestClientHttpServiceGroupConfigurer httpServiceGroupConfigurer(OAuth2AuthorizedClientManager manager) {
    return OAuth2RestClientHttpServiceGroupConfigurer.from(manager);
}
```

> **Note**: You might have expected Spring Boot to automatically set up this bean, but this isn't the case.
> There is [an open issue](https://github.com/spring-projects/spring-boot/issues/46956) about it though!

After that, you can add the `@ClientRegistrationId` annotation to any method within an HTTP interface, or on top of the HTTP interface itself.
For example:

```java
@ClientRegistrationId("github") // Add this
@HttpExchange("/user")
public interface UserClient {
    @GetExchange("/repos")
    List<GitHubRepository> getRepositories(@RequestParam String type);
}
```

And now to test it, all you need is a controller endpoint and invoke it:

```java
@GetMapping("/private-repos")
public List<GitHubRepository> getPrivateRepos() {
    return userClient.getRepositories("private");
}
```

## Conclusion

The HTTP interfaces were a nice addition to Spring Boot 3, but they weren't completely "polished" yet.
Spring Boot 4 changes that with easily being able to set them up and configuring OAuth2.

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).