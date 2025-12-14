---
title: "Dynamically register your beans with Spring's new BeanRegistrar"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "Spring has a new way of registering beans programmatically called the BeanRegistrar. In this tutorial I'll talk about how and when to use it."
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

Most of the time when you develop Spring applications, you rely on annotations such as `@Component` to register beans.
However, in some cases you want more control over when a component is registered.
In those cases, you can usually use annotations such as `@ConditionalOnProperty` to fulfill those needs.

However, once in a blue moon, you want even more control.
If that is the case, then you could use the [`BeanDefinitionRegistryPostProcessor`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/support/BeanDefinitionRegistryPostProcessor.html) class to create additional beans.

However, the API of this class was a bit complex.
Luckily, Spring Framework 7 (and thus Spring Boot 4) includes a new way to programmatically register beans: the ✨`BeanRegistrar`✨.
In this tutorial, I'll go over a simple example to illustrate how easy it is to use the new `BeanRegistrar`.

## An example

Imagine this: you're writing an extensible Spring Boot application with plugins.
To do this, you create a simple interface and several implementations:

```java
public interface AppPlugin { }

public class HomePlugin implements AppPlugin {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    public HomePlugin() {
        log.info("HomePlugin loaded");
    }
}

public class FooPlugin implements AppPlugin {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    public FooPlugin() {
        log.info("FooPlugin loaded");
    }
}

public class BarPlugin implements AppPlugin {
    private final Logger log = LoggerFactory.getLogger(this.getClass());
    public BarPlugin() {
        log.info("BarPlugin loaded");
    }
}

public class PingPlugin implements AppPlugin {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    @Scheduled(fixedRate = 1000)
    public void ping() {
        log.info("ping!");
    }
}
```

As you can see, these plugins all behave differently (well, at least one does).
So how do you give your consumers the possibility to enable the plugins they need?

One way to do this is by letting consumers manually register each plugin they need as a bean.
This works, and is probably fine.
Another way would be to provide a property for each plugin and use `@ConditionalOnProperty`.

However, today I want to try it a bit differently and configure the plugins like this:

```properties
app.plugins[0]=home
app.plugins[1]=foo
app.plugins[2]=ping
```

## Defining a `BeanRegistrar`

Defining this `BeanRegistrar` is quite simple.
First of all, we need to implement this interface:

```java
public class AppPluginBeanRegistrar implements BeanRegistrar {

    @Override
    public void register(BeanRegistry registry, Environment env) {
        // TODO: Implement
    }
}
```

Secondly, we need a way to read all `app.plugins[*]` properties.
This is a bit more difficult, as Spring only supports this kind of array-based properties within configuration properties.
The `Environment`, on the other hand, only provides simple access to properties such as:

```java
var property = env.getProperty("app.plugins[0]", String.class);
```

The solution to this problem is to either iterate over all indices until you no longer find any property, or to just scratch the idea and use a single property and split it based on a token.
A sane person would probably do the second thing, but I decided to do the first and came up with the following code:

```java
private static final String BASE_PROPERTY = "app.plugins[%s]";

    @Override
    public void register(BeanRegistry registry, Environment env) {
        IntStream
            .iterate(0, index -> index + 1)
            .mapToObj(BASE_PROPERTY::formatted)
            .map(property -> env.getProperty(property, String.class))
            .takeWhile(Objects::nonNull)
            .forEach(pluginName -> /* TODO: Implement */ null);

    }
}
```

Now the final part is to register each bean.
This can be done by using the `registry.registerBean()` method.
To make it a bit easier, I created a small method to resolve the plugin class name based on the property value:

```java
private Class<? extends AppPlugin> getPluginClass(String pluginName) {
    return switch (pluginName) {
        case "home" -> HomePlugin.class;
        case "foo" -> FooPlugin.class;
        case "bar" -> BarPlugin.class;
        case "ping" -> PingPlugin.class;
        default -> throw new IllegalArgumentException("Unknown plugin name: " + pluginName);
    };
}
```

Now all I had to do was to properly register the beans:

```java
IntStream
    .iterate(0, index -> index + 1)
    .mapToObj(BASE_PROPERTY::formatted)
    .map(property -> env.getProperty(property, String.class))
    .takeWhile(Objects::nonNull)
    .map(this::getPluginClass)
    .forEach(pluginClass -> registry.registerBean(pluginClass));
```

The nice thing is that you can do a lot more within the `registerBean()` method.
For example, you can completely customize the way the bean is set up:

```java
registry.registerBean(pluginClass, spec -> spec
    .description("AppPlugin")
    .prototype()
    .order(1)
    .lazyInit());
```

## Using a `BeanRegistrar`

The final step is to make sure your application uses the `BeanRegistrar`.
The easiest way to do this is by using the `@Import` annotation:

```java
@EnableScheduling // For PingPlugin
@SpringBootApplication
@Import(AppPluginBeanRegistrar.class) // Add this
public class Application {

	static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
```

If you run the application now, you should see the following log messages:

```none
HomePlugin loaded
FooPlugin loaded
Started Application in 0.334 seconds (process running for 5.587)
ping!
ping!
...
```

## Conclusion

`BeanRegistrar` is a powerful new tool for programmatically creating your beans.
However, personally I don't think I'll need it quite often.
Mechanisms such as the many `@ConditionalOn...` annotations will probably cover most of the needs for having to programmatically register a bean.

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).