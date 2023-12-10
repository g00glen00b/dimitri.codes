---
title: "Testing your Spring Data JPA repository"
featuredImage: "/logos/spring-data.png"
categories: ["Java", "Tutorials"]
tags: ["JPA", "Spring", "Testing"]
excerpt: "Spring Data allows you to create repositories by writing a simple interface. In this article I'll write some integration tests for a repository using DBUnit"
---

With [Spring Data](http://projects.spring.io/spring-data/) JPA, persisting data is quite easy. You no longer need to write complex DAO's or repositories, no, all you need is an interface. If you look at my Spring Boot tutorial, you will see that by writing a few lines of code for creating our interface, we're able to read, update, delete and create new records in our database. This is quite interesting, but Spring Data also allows you to write custom queries, but the question is, how do you test these custom queries? You no logner have to write code, so there's no unit to test.

### Adding custom queries to your repository

I'm going to start where I left of during the [previous tutorials](/prototyping-spring-boot-angularjs/ "Rapid prototyping with Spring Boot and AngularJS"), namely with a [simple Spring Boot application](https://github.com/g00glen00b/ng-spring-boot/tree/feature-tests). If you take a look at the `ItemRepository` interface, you'll see it's quite empty:

```java
public interface ItemRepository extends JpaRepository<Item, Integer> {

}
```

Let's change that by adding a method to retrieve all items that are checked. We can do that by writing a simple query using JPQL (JPA Query Language):

```java
@Query("SELECT i FROM Item i WHERE i.checked=true")
List findChecked();
```

If you're not familiar with Spring Data JPA, then yes, this is all you need to write.

Actually, the real Spring guru's know that the code above can be simplified even further. If you leave away the `@Query` annotation, Spring will look at the method name.

In this case, to get the same result as the code above, you would have to write the following method name: `findByCheckedTrue()`. Take a look at [the documentation](http://docs.spring.io/spring-data/jpa/docs/1.4.3.RELEASE/reference/html/jpa.repositories.html) for more info.

Anyways, you don't have to write an implementation, all of that is taken care of by the framework. However, what makes you sure that the written query is valid and that the code does work properly?

### Setting up the repository test

Before we start testing, we have to add a few dependencies. I'm going to use DBUnit for setting up a dataset before each test and a really interesting framework that integrates DBUnit with the Spring testing framework. You can check it out on [Github](http://springtestdbunit.github.io/spring-test-dbunit/).

```xml
<dependency>
  <groupId>com.github.springtestdbunit</groupId>
  <artifactId>spring-test-dbunit</artifactId>
  <version>${spring-test-dbunit.version}</version>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.dbunit</groupId>
  <artifactId>dbunit</artifactId>
  <version>${dbunit.version}</version>
</dependency>
```

I always define my versions as properties (reusability):

```xml
<dbunit.version>2.5.0</dbunit.version>
<spring-test-dbunit.version>1.2.1</spring-test-dbunit.version>
```

With our dependencies ready, it's time to write our test. Inside the **src/test/java** folder, create a package `be.g00glen00b.repository` and inside it, add a class/unit test called `ItemRepositoryIT`. Since there is no unit to test, we will have to test a few layers (Spring repository + database layer), so we're talking about writing integration tests now.

On top of the test, we have to add quite some annotations, this is the final result:

```java
@TestExecutionListeners({DependencyInjectionTestExecutionListener.class, DirtiesContextTestExecutionListener.class,
  TransactionalTestExecutionListener.class, DbUnitTestExecutionListener.class})
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@DatabaseSetup(ItemRepositoryIT.DATASET)
@DatabaseTearDown(type = DatabaseOperation.DELETE_ALL, value = { ItemRepositoryIT.DATASET })
@DirtiesContext
public class ItemRepositoryIT {

}
```

What this does is not that difficult. First of all we have to set up Spring test and make it set up all our Spring beans. We can do that by using the `@RunWith` and `@SpringApplicationConfiguration` annotations.

Non-Spring boot developers can also use a similar setup, but in stead of using the `@SpringApplicationConfiguration` annotation, they will have to set up a configuration file with a datasource, JPA configuration, repository lookup, ... and include it using the `@ContextConfiguration(classes = {TestAppConfig.class})` annotation, where `TestAppConfig` would contain your datasource/entitymanager/repository scan configuration.

The other annotations are used for setting up and tearing down our dataset after each test, most of them are reusable, so a common practice is to write an abstract class with these annotations, and extend from this class for each test class.

Now we only have to create a constant containing the location of our dataset, for example:

protected static final String DATASET = "classpath:datasets/it-items.xml";

Remember to use at least the `protected` visibility modifier, because we're using it outside the class (within the annotations).

### Setting up the dataset

Now, to test our repository, I'm going to add a dataset containing some checked and unchecked items. I'm using [DBUnit](http://dbunit.sourceforge.net/) for this, so make sure to check their documentation if you run into any problems. Add a folder **datasets** inside **src/test/resources** and inside of this folder create a file called **it-items.xml**. This file will contain our dataset, which will look like:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<dataset>
  <ITEM id="1" checked="true" description="Item 1" />
  <ITEM id="2" checked="false" description="Item 2" />
  <ITEM id="3" checked="true" description="Item 3" />
  <ITEM id="4" checked="false" description="Item 4" />
</dataset>
```

So, we will create 4 items here, two checked ones and two unchecked ones. This should give us enough data for running our tests.

### Writing a test case

Let's get back to the `ItemRepositoryIT` class. I'm going to create some fields before starting with the tests. Because Item 1 and Item 3 in our dataset should be returned when calling the `findChecked()` method, I'm going to create some constants that contain the description. I'm also going to autowire the repository itself:

```java
private static final String FIRST_ITEM = "Item 1";
private static final String THIRD_ITEM = "Item 3";
private static final String DESCRIPTION_FIELD = "description";
@Autowired
private ItemRepository repository;
```

Now, writing a test case is quite simple if you use AssertJ. If you're interested in AssertJ, make sure to read my previous tutorial.

This is my test case:

```java
@Test
public void findCheckedShouldReturnTwoItems() {
  assertThat(repository.findChecked())
    .hasSize(2)
    .extracting(DESCRIPTION_FIELD)
    .containsOnly(FIRST_ITEM, THIRD_ITEM);
}
```

We assert that the repository should return two items and that the descriptions should only contain "Item 1" and "Item 3", which makes sens, because those are our two checked items.

And yes, that's it! You will notice that, while writing your own repository tests, the hardest part is not the test itself, but writing sufficient datasets to make it possible to write good tests. When you start with relations between entities, you will have to setup those as well.

This can sometimes lead to annoying errors, because if you're missing a relation, you will get errors during your tests, but the error message wil simply be a foreign key contraint violation error, but because everything is generated, the index upon it usually has a strange name, making it hard to identify the problem.

However, there's a lot of added value by writing these tests. You do not only test your query itself, but any error within your entity mappings will also lead to errors inside the tests because it will not be able to create the proper structure again.

Remember that we said that you could simplify your method by leaving away the `@Query` annotation and changing your method name into `findByCheckedTrue()`? Well, you can verify that now by changing the name of the method, and to run your test again, it should still work.

#### Achievement: Tested your Spring Data repositories

Seeing this means you read this short tutorial about testing your Spring Data JPA repositories. If you're interested in the full code example, you can find it on [GitHub](https://github.com/g00glen00b/ng-spring-boot/tree/feature-tests). If you want to try out the code yourself, you can download an archive from [GitHub](https://github.com/g00glen00b/ng-spring-boot/archive/feature-tests.zip).
