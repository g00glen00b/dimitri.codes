---
title: "Writing dynamic queries with Spring Data JPA"
featuredImage: "../../../images/logos/spring-data.png"
categories: ["Java", "Tutorials"]
tags: ["Hibernate", "JPA", "Spring", "Spring Data"]
excerpt: "With Spring Data, we can easily write queries usinng @Query. For more dynamic queries, we can use the Example and Specification API, which we'll explore here."
---

In one of my earlier tutorials, I've explored the [basics about Spring Data JPA](/spring-data-jpa/). While that tutorial shows what you have to do in most situations, in some cases you want to have more control over your queries rather than having a fairly static one.

### Using examples

One of the possibilities to have more dynamic control over your queries, is by using [Example API](https://docs.spring.io/spring-data/commons/docs/current/api/org/springframework/data/domain/Example.html). We can use this API to construct an example object for further use within our query.

For example, let's say we have the following entity:

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "marvel_character")
public class MarvelCharacter {
    @Id
    @Column(name = "hero_name")
    private String heroName;
    @Column(name = "first_name")
    private String firstName;
    @Column(name = "last_name")
    private String lastName;
}
```

Additionally, we defined a service to optionally send a first- and a last name. When these parameters are `null`, we shouldn't filter on those fields. For example:

```java
public List<MarvelCharacter> findByName(String firstName, String lastName) {
    // TODO: Implement
}
```

Using simple queries, we could do this by defining three different methods, such as:

- `findByFirstName(String firstName)`
- `findByLastName(String lastName);`
- `findByFirstAndLastName(String firstName, String lastName)`

Obviously, this doesn't scale well, as for each new parameter, the amount of queries would double. So, how would we solve this? Using the Example API, we can use the `findAll(Example)` method that's available within a `JpaRepository`.

For example:

```java
MarvelCharacter example = MarvelCharacter
    .builder()
    .firstName(firstName) // firstName from parameter
    .lastName(lastName) // lastName from parameter
    .build();
return repository.findAll(Example.of(example));
```

The advantage of this API is that it scales much better, as `null` values are being ignored. This means that if `lastName` would be `null`, it's being ignored for the query.

Additionally, you can change the way the examples are being matched, by providing an `ExampleMatcher` parameter. For example, let's say we want to filter the `firstName` parameter case insensitively, and filtering first names that **contain** the given value rather than being an **exact match**.

In that case, we could write a matcher like this:

```java
ExampleMatcher matcher = ExampleMatcher
    .matchingAll()
    .withMatcher("firstName", contains().ignoreCase());
MarvelCharacter example = MarvelCharacter
    .builder()
    .firstName(firstName) // firstName from parameter
    .lastName(lastName) // lastName from parameter
    .build();
return repository.findAll(Example.of(example, matcher));
```

In this example, the `contains()` method is a static import of `ExampleMatcher.GenericPropertyMatchers.contains()`, which allows you to write it in a more concise way.

### Using specifications

While we can use the Example API in many cases, it's still limited and can't be used for all scenarios. Another possibility that allows you to do pretty much anything is by using the [Specification API](https://docs.spring.io/spring-data/jpa/docs/current/api/org/springframework/data/jpa/domain/Specification.html).

The specification API is an abstraction on top of the JPA Criteria API, which means we can do anything you could do with these criteria as well.

If we take the example we used previously, and convert it into specifications, we can write the following specifications:

```java
public static Specification<MarvelCharacter> firstNameContains(String expression) {
    return (root, query, builder) -> builder.like(root.get("firstName"), contains(expression));
}

public static Specification<MarvelCharacter> lastNameContains(String expression) {
    return (root, query, builder) -> builder.like(root.get("lastName"), contains(expression));
}

private static String contains(String expression) {
    return MessageFormat.format("%{0}%", expression);
}
```

In this case, we have two specifications, being `firstNameContains()` and `lastNameContains()`. Since the `Specification` interface only contains a single method, we can actually write them as a lambda expression.

This interface method passes three arguments which you can use:

1. The first parameter (`root`) allows you to select the field you want to filter on. This can be done by using `root.get("name")` or if you need joining, you can use `root.join("myField").get("name")`.
2. The second parameter (`query`) isn't used that often, but contains information about the type of query that's being executed. I'll cover one of its use cases later on in this tutorial.
3. The last parameter is the `CriteriaBuilder`, that allows you to define exactly what type of query you want to construct (`LIKE`, `IS NULL`, `CONTAINS`, `AND`, `OR`, `=`, ...).

Usually, I put these specifications within a new class, for example `MarvelCharacterSpecifications`. Since this class will only contain static methods that return a `Specification`, we can mark this class as `final`. For example:

```java
public final class MarvelCharacterSpecifications {
    // ...
}
```

Additionally, we have to change our repository, so that it extends from `JpaSpecificationExecutor`. For example:

```java
public interface MarvelCharacterRepository extends JpaRepository<MarvelCharacter, String>, JpaSpecificationExecutor<MarvelCharacter> {
}
```

Once that's done, we'll implement our service method:

```java
Specification<MarvelCharacter> specification = Specification
    // firstName from parameter
    .where(firstName == null ? null : firstNameContains(firstName))
    // lastName from parameter
    .and(lastName == null ? null : lastNameContains(lastName));
```

The nice thing with the Specification API is that we can properly chain these specifications using the `and()` and `or()` method. Additionally, `null` values are filtered out, so if we return `null` in stead of our actual specification, we can properly filter these depending on the input values. This means that if `firstName` is `null`, we won't filter by `firstNameContains()`.

This approach allows you to write more complex specifications as well, for example:

```java
public static Specification<MarvelCharacter> lastNameIn(String... values) {
    return (root, query, builder) -> builder.or(Arrays
        .stream(values)
        .map(value -> builder.equal(root.get("lastName"), value))
        .toArray(Predicate[]::new));
}
```

However, I personally recommend to keep the filtering within one specification **limited to one specific field**. Sometimes, I see people write one big specification that does everything. In my opinion, this **decreases readability** a lot. and these specifications are usually so **tightly coupled**, that they **aren't re-usable** in other scenarios.

### Join fetching with specifications

Now, so far we've seen what we could do with specifications, and more precisely the first and the third argument (`root` and `builder`). One of the use cases for the second argument, is to change your specification according to what type of query we execute.

For example, if you've used custom queries with Spring Data JPA before, you probably know that [you can't use join fetching when you're using a count query](https://stackoverflow.com/questions/21549480/spring-data-fetch-join-with-paging-is-not-working). In those cases, you usually have to provide a separate `countQuery` that doesn't do the fetching, for example:

```java
@Query(
    value = "select mc from MarvelCharacter mc left join fetch mc.team where mc.firstName like ?1",
    countQuery = "select count(mc) from MarvelCharacter where mc.firstName like ?1")
Page<MarvelCharacter> findByFirstNameFetchingTeam(String firstName, Pageable page);
```

Since Spring Data uses a count query to determine how many total elements there are when retrieving paged data, you have to provide a separate count query.

Within your specifications, you can also use join fetching, which allows you to dynamically fetch fields as well. For example, you could write a specification like this:

```java
public static Specification<MarvelCharacter> fetchTeam() {
    return (root, query, builder) -> {
        root.fetch("team");
        return null;
    };
}
```

However, just like before, if you would use this specification within a count query, it won't work.

To solve this, we can use the `query` argument to detect if we're executing a count query or not:

```java
public static Specification<MarvelCharacter> fetchTeam() {
    return (root, query, builder) -> {
        if (MarvelCharacter.class.equals(query.getResultType())) {
            root.fetch("team");
        }
        return null;
    };
}
```

In this case, we're using `query.getResultType()` to see if we're actually fetching `MarvelCharacter` objects. If we aren't, we won't fetch it.

### Using subqueries

Another purpose of the `query` parameter is to create subqueries. For example:

```java
return (root, query, builder) -> {
    SubQuery<MarvelCharacter> subquery = query.subquery(MarvelCharacter.class);
    Root<MarvelCharacter> = subquery.from(MarvelCharacter.class);
    Predicate isTony = builder.equal(subroot.get("firstName"), "Tony");
    Predicate sameId = builder.equal(subroot.get("id"), root.get("id"));
    return builder.exists(subquery.select(subroot).where(isTony, sameId));
};
```

The JPQL variant of this query would become:

```sql
select mc from MarvelCharacter mc where not(exists(select mc2 from MarvelCharacter mc2 where mc2.firstName = 'Tony' and mc2.id = mc.id));
```

In this case, it's pretty useless, as there's no point in using a subquery here, but for some cases, like verifying that all objects in a one-to-many relationship match certain criteria, subqueries could be very helpful.

With that, we've seen how to write more dynamic queries by using the Example and Specification APIs.
