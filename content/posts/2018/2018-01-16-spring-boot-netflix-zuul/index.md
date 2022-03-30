---
title: "Using the Netflix stack with Spring boot: Zuul"
date: "2018-01-16"
featuredImage: "../../../images/logos/netflix-oss.png"
categories: ["Java", "Tutorials"]
tags: ["Eureka", "Gateway", "Netflix", "Spring boot", "Spring cloud", "Zuul"]
excerpt: "Spring boot has several integrations available for Netflix components such as Zuul. In this tutorial I'll demonstrate how Zuul can be used to handle several cross-cutting concerns on a network-based level, such as CORS headers and handling multipart requests."
---

You might have heard of the term [cross-cutting concerns](https://stackoverflow.com/questions/23700540/cross-cutting-concern-example) in the past. If not, cross-cutting concerns are concerns that apply to all layers of the application. Examples of these concerns are logging, monitoring, security, ... .

If you think about it, some cross-cutting concerns also apply to microservices. Perhaps you want to monitor how long certain requests take, or to log how many internal server errors are happening, or perhaps you want to apply a layer of security to all of your services, or you want to apply CORS headers to all requests, ... . In Java, they're often applied by using [Aspect-oriented Programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming) or AOP. However, if you're working with services that communicate over the network, you'll have to use a different approach, and this is where gateways like [Zuul](https://github.com/Netflix/zuul) become interesting.

**Be aware**, since Zuul is built upon the Servlet 2.5 API, and doesn't match the reactive paradigm used by Spring 5 and Spring boot 2, it will likely be replaced by the [**Spring cloud gateway**](https://github.com/spring-cloud/spring-cloud-gateway) component in the future.

### What is Zuul?

Zuul is a gateway service, which means that it forwards requests to other microservices. This is interesting, because if you use Zuul as an edge service to forward all requests, it could be used to manage these cross-cutting concerns. For example, you can add logging, monitoring, security and things like CORS headers to the gateway service, and that will do the trick.

![Zuul as a gateway schema](content/posts/2018/2018-01-16-spring-boot-netflix-zuul/images/zuul.png)

If you use Zuul with Spring boot and Eureka, things become even better since you won't have to configure anything else except the location of Eureka. All routes will be configured for you!

### Getting started with Eureka

To get started with Zuul and Spring boot, you head over to the [Spring Initializr](https://start.spring.io/) (shame on you if you didn't bookmark it yet!), and generate a new project with both **Zuul** and **Eureka Discovery** as dependencies. The Eureka Discovery dependency is optional, but if you don't use it, you'll have to manually define your routes. If you don't know how to set up Eureka, you can view [my article about Eureka](/using-the-netflix-stack-with-spring-boot-eureka/).

![Spring Initializr](content/posts/2018/2018-01-16-spring-boot-netflix-zuul/images/spring-initialzr-gateway-eureka.png)

Once you're set up, you should add both the `@EnableZuulProxy` and `@EnableEurekaClient` annotations to the main class. For example:

```java
@SpringBootApplication
@EnableZuulProxy
@EnableEurekaClient
public class GatewayServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayServiceApplication.class, args);
    }
}
```

After that you configure the Eureka URL using the `eureka.instance.client.serviceUrl.defaultZone` property in **application.properties** and you're done.

```
eureka.instance.client.serviceUrl.defaultZone=http://localhost:8001/eureka/
```

In this example, I'm running Eureka on port 8001.

Now, by default all applications registered with Eureka will be able to be used on the gateway service by using the same path, but prepending it with the name of the application. For example, if I have an endpoint called `/api/profile` on my service called **profile-service**, then I'll be able to use `/profile-service/api/profile` on the gateway service.

![Original request through Postman](content/posts/2018/2018-01-16-spring-boot-netflix-zuul/images/postman-original-api-profile.png)

![Same request, through gateway with Postman](content/posts/2018/2018-01-16-spring-boot-netflix-zuul/images/postman-gateway-request.png)

### Getting started without Eureka

If you're not planning to use any service discovery like Eureka, well, good news for you as well! Zuul can be used without Zuul, to do that, you just have to configure some additional routes.

First of all, create a project like we just did, but this time without the **Eureka Discovery** dependency.

![Spring initializr](content/posts/2018/2018-01-16-spring-boot-netflix-zuul/images/spring-initializr-gatewya.png)

After that, you have to add the `@EnableZuulProxy`:

```java
@SpringBootApplication
@EnableZuulProxy
public class GatewayServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayServiceApplication.class, args);
    }
}
```

Now we just have to disable using Ribbon and define our routes in **application.properties**:

```
zuul.routes.profile-service.url=http://localhost:8005
ribbon.eureka.enabled=false
```

### Adding CORS headers

One of the use cases we use the gateway service for is to enable [Cross-Origin Resource Sharing headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) so we can call microservices from within our webbrowser. To do that, we created a bean of the [`CorsFilter`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/filter/CorsFilter.html) type in our main class:

```java
@Bean
public CorsFilter corsFilter() {
    final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    final CorsConfiguration config = new CorsConfiguration();
    config.setAllowCredentials(true);
    config.setAllowedOrigins(Collections.singletonList("*"));
    config.setAllowedHeaders(Collections.singletonList("*"));
    config.setAllowedMethods(Arrays.stream(HttpMethod.values()).map(HttpMethod::name).collect(Collectors.toList()));
    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
}
```

**Note:** This is likely the most permissive CORS header configuration, so be aware that you may want to restrict this if you use it yourself!

After that, you can restart the application and you can now send requests from within your webbrowser to the gateway! To verify this, you can call the same endpoint as before, but this time change the HTTP method to `OPTIONS`. When you do that, you should see that there is a header called `Access-Control-Allow-Credentials` and `Access-Control-Allow-Origin` even though they're not there on the original response.

![CORS header request with Postman](content/posts/2018/2018-01-16-spring-boot-netflix-zuul/images/postman-gateway-cors.png)

### Sensitive headers

We have our gateway service up and running, but there are a few gotchas I also want to mention in this article. One of these is the configuration of the sensitive headers. By default, Zuul does not pass headers like `Authorization`, `Set-Cookie` and `Cookie`. This means that if you need to send these headers to the destined application, you'll have to configure it.

To change this, you can configure the `sensitiveHeaders` property within `application.properties` for each route. For example, if we have a **uaa-service** that uses these headers, we can whitelist all headers by configuring:

zuul.routes.uaa-service.sensitiveHeaders=

By leaving this empty, you're effectively telling Spring + Zuul that there are no sensitive headers.

### Multipart requests

Another thing you have to know is that Zuul does not pass multipart responses for `PUT` requests. Multipart requests are often used for file uploading, so if you need this, you have to fix this by creating your own `MultipartResolver` bean. By default, the `isMultipart()` method will only be `true` for `POST` requests. To change this you can write:

```java
@Bean
public MultipartResolver multipartResolver() {
    return new StandardServletMultipartResolver() {
        @Override
        public boolean isMultipart(HttpServletRequest request) {
            boolean methodMatches = Arrays.stream(SUPPORTED_MULTIPART_METHODS)
                .anyMatch(method -> method.matches(request.getMethod()));
            String contentType = request.getContentType();
            return methodMatches && (contentType != null && contentType.toLowerCase().startsWith("multipart/"));
        }
    };
}
```

Basically this is the same as the default behaviour, except that the method should be listed within `SUPPORTED_MULTIPART_METHODS`. This is a constant which I defined as:

```java
private static final HttpMethod[] SUPPORTED_MULTIPART_METHODS = { HttpMethod.POST, HttpMethod.PUT };
```

Now you're ready to serve cross-domain requests and multipart requests without having to change any relevant code in your other microservices.

#### Achievement: The gatekeeper of Gozer

If you’re seeing this, then it means you successfully managed to make it through this tutorial. If you’re interested in the full code example, you can find it on [GitHub](https://github.com/g00glen00b/microservice-demo/tree/master/gateway-service).
