---
title: "New way to map enums with Spring Boot 4 and Hibernate 7"
featuredImage: "/logos/spring-boot.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Advent of Spring"]
excerpt: "Custom enum mappings in your entities became a lot easier in Spring Boot 4 thanks to some changes within Hibernate 7 and JPA 3.2. Check out this blogpost to learn more!"
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

When you upgrade your Spring Boot project, you not only upgrade to a new Spring Boot version, but also upgrade a ton of libraries under the hood.
One of these libraries is Hibernate, which you're probably familiar with if you worked with JPA, including when you use the `spring-boot-starter-data-jpa` library.

Spring Boot 4 upgrades **Hibernate** to **v7**, and with that comes the **Jakarta Persistence API v3.2** (JPA).
One of the new features that JPA 3.2, and thus also Hibernate 7 brings us is the new `@EnumeratedValue` annotation, which provides an alternative way to map enumerations in JPA.

## Basic mapping with `@Enumerated`

Imagine the following entity and enum:

```java
@Entity
class Medication {
    @Id
    private UUID id;
    private String name;
    private double dose;
    private DoseType doseType;
    
    // ...
}

enum DoseType {
    MILLIGRAM,
    MILLILITER,
    TABLETS
}
```

If you use this entity, it wants to map the `dose_type` column to the ordinal value of the enumeration.
This would mean that a medication with `DoseType.TABLETS` would end up with a `dose_type` of 2.

This works, but you probably want to store something more readable in your database.
Until now, the most common solution was to use the `@Enumerated` annotation and specify an `EnumType`.

For example, the following mapping would be the equivalent of using no `@Enumerated` annotation:

```java
@Enumerated(EnumType.ORDINAL)
private DoseType doseType;
```

Another possibility is to use `EnumType.STRING`:

```java
@Enumerated(EnumType.STRING)
private DoseType doseType;
```

Once you apply this annotation, Hibernate will store the `'MILLIGRAM'`, `'MILLILITER'` or `'TABLETS'` within the `dose_type` column.

## Advanced mapping with `AttributeConverter`

Now, let's imagine that we want to have a more customized mapping of our `DoseType`, for example by introducing a `label` field:

```java
enum DoseType {
    MILLIGRAM("mg"),
    MILLILITER("ml"),
    TABLETS("tablets");
    
    private final String label;
    
    DoseType(String label) {
        this.label = label;
    }
    
    public String getLabel() {
        return this.label;
    }
}
```

If we want to store this `label` value inside our database, the only possibility we had so far was to define a custom `AttributeConverter`.
For example:

```java
@Converter(autoApply = true)
class DoseTypeConverter implements AttributeConverter<DoseType, String> {
    @Override
    public String convertToDatabaseColumn(DoseType type) {
        return type.getLabel();
    }

    @Override
    public DoseType convertToEntityAttribute(String dbData) {
        return Arrays
            .stream(DoseType.values())
            .filter(doseType -> doseType.getLabel().equals(dbData))
            .findAny()
            .orElseThrow();
    }
}
```

This works, but it does require some boilerplate code, especially if you have multiple of these enum conversions within your code.

## A new kid on the block: `@EnumeratedValue`

With Spring Boot 4 / Hibernate 7 / JPA 3.2 we now have a new solution to the problem; the `@EnumeratedValue` annotation.
Simply apply this to the field that contains your mapping, and you're ready to go!
No more custom conversions needed!

```java
enum DoseType {
    MILLIGRAM("mg"),
    MILLILITER("ml"),
    TABLETS("tablets");
    
    // Starting with Spring Boot 4, this is all you need!
    @EnumeratedValue
    private final String label;
    
    // ...
}
```

## Conclusion

If you're using custom conversions often with enumerations in your entities, then make sure to check out `@EnumeratedValue`.
This will surely reduce some lines of code!

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).