---
title: "Writing your own Spring boot starter"
featuredImage: "../../../images/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring boot"]
excerpt: "Spring boot comes with many starters that do most of the work for you. The nice thing is that you can also write your own Spring boot starters as well, and in this tutorial, we'll figure out what we need to do to make our own Spring boot starter."
---

If you worked with Spring boot before, you know it, there are various starters out there. These starters automatically configure all kind of things so that you no longer have to. This allows you to get started more quickly, and not to be bothered about configuration that is usually a copy-paste from something else. The nice thing is that you're not limited to the Spring boot starters that are already out there, since you can write your own starters as well.

### Getting started

Rather than using the Spring Initializr here, I'm going to create a simple Java/Maven project. Then the first thing we do is to add the **spring-boot-dependencies** to our dependency management:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>1.5.6.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

This allows us to use any Spring dependency we'd like, without having to import a whole starter/BOM and without having to provide the version numbers by ourselves.

The next step is to add the following two dependencies:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-autoconfigure</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

The first dependency allows us to use the proper annotations to create our own (conditional) configuration classes, while the second dependency allows us to generate proper metadata for our configuration properties, so IDEs can pick those up in their intellisense.

In this tutorial, I'm going to write a starter to provide the Prometheus endpoint for monitoring that I [talked about before](/monitoring-spring-prometheus-grafana/). To do that, I'm also going to add the **simpleclient\_spring\_boot**, **simpleclient\_hotspot**, **simpleclient\_servlet**, **javax.servlet-api** and **commons-lang3** dependencies.

### Configuration properties

When you think of the essential parts of Spring boot, you probably think about the appliction properties. When you write your own Spring boot starter, you probably want to make it configurable as well. To do this, you can create your own class, and annotate it with `@ConfigurationProperties`. In my case, I want to be able to configure my monitoring library like this:

```yaml
monitoring:
  path: /prometheus
  interval: 10000
  matchers:
    - name: api.user
      method: GET
      matcher: /api/user
    - name: api.token
      method: GET
      matcher: /api/token
    - name: prometheus
      method: GET
      matcher: /prometheus
    - name: metrics
      method: GET
      matcher: /metrics
```

So, the classes I created were:

```java
@ConfigurationProperties("monitoring")
public class MonitoringProperties {
    private String path = "/prometheus";
    private int interval = 10;
    private List<MonitoringPathMatcher> matchers;

    // Getters + Setters ...
}
```

And also:

```java
public class MonitoringPathMatcher {
    private static final AntPathMatcher MATCHER = new AntPathMatcher();
    private String name;
    private HttpMethod method;
    private String matcher;

    // Getters + Setters + Equals + Hashcode

    public boolean isMatching(HttpServletRequest request) {
        return getMethod().matches(request.getMethod()) && MATCHER.match(getMatcher(), request.getServletPath());
    }
}
```

The `@ConfigurationProperties` indicates that this POJO will be used for all configuration properties prefixed with monitoring. The property names on the other hand should have the same name as in the POJO. So in this case, `monitoring.path` would match the `path` property in the `MonitoringProperties` class.

If you use camelcase in your property names, you can either use `monitoring.camelCase=...` or `monitoring.camel-case=...` to match.

To improve the usability of your library, you could add comments to the properties of your configuration properties, for example:

```java
/**
 * Path of the Prometheus metrics endpoint
 */
private String path = "/prometheus";
```

If you used the **spring-boot-configuration-processor** dependency, it will use these comments as metadata. When you do this, IDE's may pick them up and show them to the developer. This is what it looks like with IntelliJ:

![IntelliJ configuration properties intellisense](./images/Screenshot-2018-01-14-17.19.37.png)

### Creating your own autoconfiguration

The next step is to create your own autoconfiguration class. To do this, you start by creating a simple class and annotating it with the `@Configuration` annotation, like this:

```java
@Configuration
public class MonitorAutoConfiguration {
    // ...
}
```

After that, you have to enable your configuration properties you created earlier, by adding the `@EnableConfigurationProperties` annotation. For example:

```java
@Configuration
@EnableConfigurationProperties(MonitoringProperties.class)
public class MonitorAutoConfiguration {
    // ...
}
```

Now you can also customise when you want Spring to invoke your autoconfiguration. In our case, since we're a monitoring library, we want to invoke it after the metric repository autoconfiguration of the Spring boot actuator has been loaded. To do this, we can use the `@AutoConfigureAfter` annotation:

```java
@Configuration
@EnableConfigurationProperties(MonitoringProperties.class)
@AutoConfigureAfter(MetricRepositoryAutoConfiguration.class)
public class MonitorAutoConfiguration {
    // ...
}
```

### Conditionals

Now, some Spring boot starters are only invoked when certain dependencies or other things are met. For example, the JPA autoconfiguration will probably only trigger when a driver is on the classpath, while some autoconfigurations will only trigger when a certain property is set.

In our case, we want to be sure that both the `GaugeService` and the `CounterService` classes are on the classpath. We can do this, by adding the `@ConditionalOnClass` annotation. Additionally, we only want to invoke our autoconfiguration if the project is a web application. If the project is not a web application, we can't do anything with the Prometheus endpoint, so we can't monitor it either with our library. To do this, you can use the `@ConditionalOnWebApplication` annotation:

```java
@Configuration
@AutoConfigureAfter(MetricRepositoryAutoConfiguration.class)
@ConditionalOnWebApplication
@ConditionalOnClass(name = {"org.springframework.boot.actuate.metrics.CounterService", "org.springframework.boot.actuate.metrics.GaugeService"})
@EnableConfigurationProperties(MonitoringProperties.class)
public class MonitorAutoConfiguration {
    // ...
}
```

The nice thing about the `@ConditionalOnClass` annotation is that you can provide the classes as strings, so you don't have to add those classes to your classpath somehow.

Now that you've properly annotated your configuration class, you can start adding beans to it that you need for your autoconfiguration to work. In my case, I need a filter that monitors certain paths, and I have to set up the Prometheus client configuration to automatically generate the `/prometheus` endpoint. So this is how I implemented my autoconfiguration:

```java
@Bean
public SpringBootMetricsCollector springBootMetricsCollector(Collection<PublicMetrics> publicMetrics) {
    SpringBootMetricsCollector springBootMetricsCollector = new SpringBootMetricsCollector(publicMetrics);
    springBootMetricsCollector.register();
    return springBootMetricsCollector;
}

@Bean
public ServletRegistrationBean servletRegistrationBean(MonitoringProperties properties) {
    DefaultExports.initialize();
    return new ServletRegistrationBean(new MetricsServlet(), properties.getPath());
}

@Bean
public MonitoringFilter filter(CounterService counterService, GaugeService gaugeService, MonitoringProperties monitoringProperties) {
    return new MonitoringFilter(counterService, gaugeService, monitoringProperties);
}
```

You can see here that we used the `MonitoringProperties` in the filter we created, and also in the `ServletRegistrationBean` to create the `/prometheus` endpoint.

### Final step

Before including your Spring boot starter in your other projects, you have to do one more thing. To make the application pick up our Spring boot starter, we have to create a special property file called **spring.factories**. This file should be placed within the **src/main/resources/META-INF** folder and should contain the `org.springframework.boot.autoconfigure.EnableAutoConfiguration` property, for example:

```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=be.g00glen00b.monitor.MonitorAutoConfiguration
```

This property should contain the fully qualified name of the autoconfiguration class, in our case this was `be.g00glen00b.monitor.MonitorAutoConfiguration`.

Now that you've done that, you're ready to include the library in your other projects by defining it as a dependency. By doing that, your autoconfiguration will automagically being invoked (if all conditionals are met), and all beans will be created.

#### Achievement: Started with Spring boot Starters

If you’re seeing this, then it means you successfully managed to make it through this tutorial. If you’re interested in the full code example, you can find it on [GitHub](https://github.com/g00glen00b/microservice-demo/tree/master/monitor-starter).
