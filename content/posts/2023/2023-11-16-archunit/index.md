---
title: "Testing your Java code structure with ArchUnit"
featuredImage: "../../../images/logos/java.png"
categories: ["Java", "Tutorials"]
tags: ["ArchUnit", "JUnit", "Testing"]
excerpt: "In this tutorial I'll give an introduction to ArchUnit. This is a library that helps you with testing your Java code architecture, such as naming conventions, package structures, which classes can access others and so on."
---

## Intro

When you're developing an application, you usually try to follow certain conventions. 
Examples of these conventions are:

- Whether you want to write an interface for every service or not.
- What package structure you want to use.
- Whether you want to work with Data Transfer Objects (DTOs) or not.
- Whether your classes should follow certain naming convention (eg. `XController`, `YService`, ...).
- Which classes can access others (eg. a controller probably shouldn't access a repository).
- ...

To enforce these conventions, a common way to do this is by relying on code reviews.
While code reviews are great, they happen very late in the development process.
By the time someone reviews your code and notices the irregularities, a developer already wrote all their code, their tests and so on.

Another alternative is that you can automate these tests by using [ArchUnit](https://www.archunit.org/).
According to the website, ArchUnit can be defined as:

> ArchUnit is a free, simple and extensible **library** for checking the **architecture of your Java code** using any plain Java unit **test framework**.

This means that you can use ArchUnit within a testing framework like JUnit to check whether your code follows certain rules.

## Getting started

To start, you first have to add the right dependency depending on the testing framework you use.
If you use JUnit 5, you can add the following dependency:

```xml
<dependency>
    <groupId>com.tngtech.archunit</groupId>
    <artifactId>archunit-junit5</artifactId>
    <version>1.2.0</version>
    <scope>test</scope>
</dependency>
```

After that, you need to create a test.
For example:

```java
public class NamingConventionTest {
    @Test
    void myTest() {
        // TODO: Implement
    }
}
```

Once you created your test class, you have to tell ArchUnit which classes you want to analyze.
This is because ArchUnit cannot tell the difference between your classes and the classes you import from libraries.

You can do this by writing the following:

```java
public class NamingConventionTest {
    @Test
    void myTest() {
        // Add this:
        JavaClasses classes = new ClassFileImporter().importPackages("codes.dimitri.myproject");
        // TODO: Implement
    }
}
```

In this example, `codes.dimitri.myproject` is the name of the rootpackage of my project.

The next step is to define your architectural rule by using the fluent API provided by ArchUnit.
For example, if you want to verify that all your controllers have a name ending with `...Controller`, you can write something like:

```java
public class NamingConventionTest {
    @Test
    void controllersShouldHaveNameEndingWithController() {
        JavaClasses classes = new ClassFileImporter().importPackages("codes.dimitri.my-project");
        // Add this:
        ArchRule rule = classes()
            .that().areMetaAnnotatedWith(Controller.class)
            .should().haveSimpleNameEndingWith("Controller");
        // TODO: Implement
    }
}
```

Then the final step before running your test is to test the `ArchRule` against the packages you imported by using:

```java
public class NamingConventionTest {
    @Test
    void controllersShouldHaveNameEndingWithController() {
        JavaClasses classes = new ClassFileImporter().importPackages("codes.dimitri.my-project");
        ArchRule rule = classes()
            .that().areMetaAnnotatedWith(Controller.class)
            .should().haveSimpleNameEndingWith("Controller");
        rule.check(classes); // <!-- Add this
    }
}
```

However, as you can see this would lead to a lot of repetition.
To avoid this, you can use the `@AnalyzeClasses` annotation in stead of the `ClassFileImporter`.
For example:

```java
// Add this:
@AnalyzeClasses(packages = "codes.dimitri.my-project")
public class NamingConventionTest {
    // ...
}
```

In addition, rather than writing complete test methods, you can define the `ArchRule` as a field in your test class and annotate it with `@ArchTest`.
For example:

```java
@AnalyzeClasses(packages = "codes.dimitri.my-project")
public class NamingConventionTest {
    @ArchTest
    public static final ArchRule controllersShouldHaveNameEndingWithController = classes()
        .that().areMetaAnnotatedWith(Controller.class)
        .should().haveSimpleNameEndingWith("Controller"); 
}
```

## Exploring the standard API

### Checking whether controllers follow a naming convention

As we've seen so far, we can test whether a class has a specific suffix by using the `haveSimpleNameEndingWith()` method.
To select the proper classes, we can use the `areMetaAnnotatedWith()` method to check for classes that are annotated with `@Controller`.
The "meta"-part means that it also includes annotations that are on their own annotated with the given annotation.
For example, the `@RestController` annotation of Spring is also annotated with `@Controller`.
Because of that, classes that are annotated with `@RestController` are also subject to this rule.

```java
@ArchTest
public static final ArchRule controllersShouldHaveNameEndingWithController = classes()
    .that().areMetaAnnotatedWith(Controller.class)
    .should().haveSimpleNameEndingWith("Controller");
```

### Checking whether certain classes are located in a specific package

In some cases, you want to group certain type of classes together.
For example, in some cases you want to group DTOs together in a single package, entities within a different package and so on.

A way to test this is by using:

```java
@ArchTest
public static final ArchRule dtosShouldBeInDTOPackage = classes()
    .that().haveSimpleNameEndingWith("DTO")
    .should().resideInAPackage("..dto..")
    .because("DTOs should be grouped together in a DTO-specific package");
```

The `resideInAnyPackage()` method allows you to use a similar syntax as within AOP pointcuts where the double dot matches any number of packages.
For example, the `...dto..` pattern would match something like `x.y.z.dto` or `x.dto.foo`.

Also interesting is that you can provide a reason within the `because()` method at the end of your `ArchRule`.
This reason is visible when the test fails, and allows developers to see why a rule was introduced.

### Checking whether DTOs are records

Starting with Java 14, records were introduced.
Records are immutable data classes, and because of that, they're ideal for cases like DTOs.
To verify that all DTOs are records, you could write a rule like this:

```java
@ArchTest
public static final ArchRule dtosShouldBeRecords = classes()
    .that().haveSimpleNameEndingWith("DTO")
    .should().beRecords()
    .because("DTOs should be immutable");
```

### Checking whether services are interfaces

In some projects, people want to create an interface for each service to reduce coupling.
A way to verify this is by verifying that all classes that end with `...Service` should be an interface:

```java
@ArchTest
public static final ArchRule servicesShouldBeInterfaces = classes()
    .that().haveSimpleNameEndingWith("Service")
    .should().beInterfaces()
    .because("service contracts should be public interfaces and implementations should be hidden");
```

### Check whether your methods have a specific annotation

If you're writing a controller, you probably want to make sure that methods that start with `get...` or `find...` are annotated with `@GetMapping` rather than another type of mapping (`@PostMapping`, ...).
To enforce this, you could write a rule like this:

```java
@ArchTest
public static final ArchRule findControllerMethodsShouldBeGetMappings = methods()
    .that().arePublic()
    .and().areDeclaredInClassesThat().areMetaAnnotatedWith(Controller.class)
    .and().haveNameStartingWith("find")
    .should().beMetaAnnotatedWith(GetMapping.class);
```

Similarly, you probably also want to check that all public methods within a controller are either mapping methods or exception handlers.
To verify this, you could write a test like this:

```java
@ArchTest
public static final ArchRule publicControllerMethodsShouldBeRequestMappingsOrExceptionHandlers = methods()
    .that().arePublic()
    .and().areDeclaredInClassesThat().areMetaAnnotatedWith(Controller.class)
    .should().beMetaAnnotatedWith(RequestMapping.class)
    .orShould().beMetaAnnotatedWith(ExceptionHandler.class);
```

### Making sure classes don't rely on other specific classes

If you're working with Data Transfer Objects or DTOs in your project, you probably want to avoid that a controller can return an entity.
To verify this, you could use the `noClasses()` method to write an inverse rule:

```java
@ArchTest
public static final ArchRule controllersShouldNotRelyOnEntities = noClasses()
    .that().areMetaAnnotatedWith(Controller.class)
    .should().dependOnClassesThat().areMetaAnnotatedWith(Entity.class)
    .because("controllers should use DTOs in stead of entities");
```

### Writing your own conditions

While the ArchUnit API is very extensive, it does not contain a fluent method for all cases.
However, this isn't really a problem as ArchUnit is extensible.

One way to extend ArchUnit is by writing your own conditions.
For example, in one of our projects we require that all controller methods are documented with the OpenAPI specification (`@Operation`) and should contain a security schema.
To verify this, we wrote our own `ArchCondition`:

```java
private static final ArchCondition<JavaMethod> beSecured = new ArchCondition<>("requires security documentation") {
    @Override
    public void check(JavaMethod method, ConditionEvents events) {
        // ...
    }
};
```

The first step is that we wanted to check whether the given method is annotated with `@Operation`.
To do this, we added the following condition:

```java
if (!method.isAnnotatedWith(Operation.class)) {
    String message = String.format("Method %s is not annotated with @Operation", method.getFullName());
    events.add(SimpleConditionEvent.violated(method, message));
}
```

In case the method does not follow our condition, we can add a new `ConditionEvent`.
The easiest way to do this is by using the `SimpleConditionEvent.violated()` method.

The final part is that we wanted to obtain the `@Operation` annotation itself and check whether it has a `security` attribute:

```java
Operation operation = method.getAnnotationOfType(Operation.class);
if (operation.security() == null || operation.security().length == 0) {
    String message = String.format(
        "Method %s is annotated with @Operation, but does not contain a security attribute",
        method.getFullName());
    events.add(SimpleConditionEvent.violated(method, message));
}
```

Now that we have our condition, we can apply it within any `ArchRule` like this:

```java
@ArchTest
public static final ArchRule controllersShouldHaveOpenAPISpecification = methods()
    .that().areMetaAnnotatedWith(RequestMapping.class)
    .should(beSecured) // This refers to the condition
    .because("controller methods should be documented with Open API");
```

### Generic rules

In addition to defining our own rules, ArchUnit also provides a few rules out of the box.
For example, there's a [`NO_CLASSES_SHOULD_USE_FIELD_INJECTION`](https://javadoc.io/static/com.tngtech.archunit/archunit/1.2.0/com/tngtech/archunit/library/GeneralCodingRules.html#NO_CLASSES_SHOULD_USE_FIELD_INJECTION) rule that you can use to check if you're using annotations such as `@Autowired` on your fields.

You can use these standard rules like this:

```java
@ArchTest
public static final ArchRule noClassesShouldUseFieldInjection = GeneralCodingRules.NO_CLASSES_SHOULD_USE_FIELD_INJECTION; 
```

This also means that you can wrap your own rules into a separate library and include it in multiple projects.

## Conclusion

### Why should you use ArchUnit

Recently I answered [a question on Stack Overflow](https://stackoverflow.com/q/77280308/1915448) where the author wanted each method to be annotated with `@PreAuthorize`.
One way of doing this is by adding a runtime check using reflection ([an example](https://www.baeldung.com/spring-deny-access)).
The drawbacks of using a runtime check like this is that:

- It requires you to run the application to verify whether all endpoints are secured.
- The code that does this relies on a bunch of (ugly) reflection.

Alternatively, I suggested to write a test with ArchUnit, which has the benefits that:

- **You get a faster feedback loop** as you can run the tests immediately.
- You can use the **clean, fluent API** provided by ArchUnit in stead of using the reflection API directly.

There is however one thing to realize and that is that, like any other Java framework, ArchUnit is affected by type erasure.
This means that it's not possible to check whether a field is of type `List<String>` for example and that you can only check for `List.class`.
ArchUnit makes this pretty clear though, because the methods will be named like `haveRawType()`, `doNotHaveRawType()`, ... .

Another thing I noticed is that IDE's like IntelliJ do not provide support for `@ArchTest`.
They mark these fields as unused, and do not allow you to run individual tests either.