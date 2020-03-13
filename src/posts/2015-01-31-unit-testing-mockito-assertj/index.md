---
title: "Unit testing with Mockito and AssertJ"
date: "2015-01-31"
---

A few weeks ago I wrote [my very first Spring Boot application](http://wordpress.g00glen00b.be/prototyping-spring-boot-angularjs/ "Rapid prototyping with Spring Boot and AngularJS") and I was quite astonished about the result. Now, I did want to complete the application by writing some tests and so I did. In my [previous tutorial](http://wordpress.g00glen00b.be/spring-boot-rest-assured/ "Easy integration testing with Spring Boot and REST-Assured") I wrote several integration tests, and now it's time to write some unit tests as well.

First of, the code I will be testing is a Spring RestController I wrote a while ago, the code looks like this:

@RestController
@RequestMapping("/items")
public class ItemController {
  @Autowired
  private ItemRepository repo;

  @RequestMapping(method = RequestMethod.GET)
  public List findItems() {
    return repo.findAll();
  }

  @RequestMapping(method = RequestMethod.POST)
  public Item addItem(@RequestBody Item item) {
    item.setId(null);
    return repo.saveAndFlush(item);
  }

  @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
  public Item updateItem(@RequestBody Item updatedItem, @PathVariable Integer id) {
    Item item = repo.getOne(id);
    item.setChecked(updatedItem.isChecked());
    item.setDescription(updatedItem.getDescription());
    return repo.saveAndFlush(item);
  }

  @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
  @ResponseStatus(value = HttpStatus.NO\_CONTENT)
  public void deleteItem(@PathVariable Integer id) {
    repo.delete(id);
  }

  @ResponseStatus(HttpStatus.BAD\_REQUEST)
  @ExceptionHandler(value = { EmptyResultDataAccessException.class, EntityNotFoundException.class })
  public void handleNotFound() { }
}

### Maven configuration

If you followed my previous tutorial, you can skip this section as it is mostly a recap of what I did in that tutorial.

In my previous tutorial, I already explained how to configure Maven. First of all we need the **maven-surefire-plugin**:

<plugin>
  <artifactId>maven-surefire-plugin</artifactId>
  <configuration>
    <skipTests>${unit-tests.skip}</skipTests>
    <excludes>
      <exclude>\*\*/\*IT.java</exclude>
    </excludes>
  </configuration>
</plugin>

I'm using a property called `${unit-tests.skip}`, though I always recommend running the unit tests.... but you never know.

Now, in this tutorial I will be using Mockito and AssertJ, if you haven't heard of them, make sure to check them out! But obviously, we will have to add those to our classpath as well, so let's add them as Maven dependencies, together with JUnit.

<dependency>
  <groupId>junit</groupId>
  <artifactId>junit</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>org.assertj</groupId>
  <artifactId>assertj-core</artifactId>
  <version>${assertj.version}</version>
</dependency>
<dependency>
  <groupId>org.mockito</groupId>
  <artifactId>mockito-core</artifactId>
</dependency>

The application I'm going to write unit tests for is a Spring boot application, because the parent POM already has JUnit as a managed dependency, we don't need to provide a version for that library.

Just like the property for skipping the unit tests before, I'm also using properties here (`{assertj-version}`). Obviously we have to define those as well:

<properties>
  <unit-tests.skip>false</unit-tests.skip>
  <assertj.version>1.7.0</assertj.version>
</properties>

If you're using Spring Boot, then you don't have to define a version for Mockito, since it's already included in the dependency management of [the parent POM](https://github.com/spring-projects/spring-boot/blob/master/spring-boot-dependencies/pom.xml).

### Using the builder pattern

I really like writing builders for my model classes, because they make it so much easier to create new model objects. In this case I will be writing a builder for my model, the `Item` class.

So let's create the `ItemBuilder` class inside the `be.g00glen00b.builders` package inside the test source folder (**src/test/java**). The content of this file is quite simple, I wrote a method for each setter, and a separate `build()` method:

package be.g00glen00b.builders;

import be.g00glen00b.model.Item;

public class ItemBuilder {
  private Item item = new Item();
  
  public ItemBuilder id(int id) {
    item.setId(id);
    return this;
  }
  
  public ItemBuilder description(String description) {
    item.setDescription(description);
    return this;
  }
  
  public ItemBuilder checked() {
    item.setChecked(true);
    return this;
  }
  
  public Item build() {
    return item;
  }
}

By returning an `ItemBuilder` with each method, I can chain them up, for example:

new ItemBuilder().description("My item").checked().build();

### Setting up JUnit with Mockito

Well, we've set up all code we need, so now it's time to write a test case. Mockito provides a simple runner for JUnit, which makes it possible to automatically inject mocks inside your tested classes. This makes testing really easy. To set up a JUnit test case with Mockito, you need to add some annotations to it, for example:

@RunWith(MockitoJUnitRunner.class)
public class ItemControllerTest {
  @InjectMocks
  private ItemController controller;
  @Mock
  private ItemRepository repository;
}

That's all we need to do, just add a `@RunWith()` annotation with the `MockitoJUnitRunner` and by doing so you can inject all mocked objects with `@Mock` and the test class (that needs injected mocks) with `@InjectMocks`.

This makes testing really easy, because now we have a testable object (`controller`) and the mocks that are injected (`repository`). After running each test, the mocks are reset automatically and new instances are created, so it leaves no trace behind.

Before writing our tests, I'm going to need some test models to use with our mocks. Simply add the following constants:

private static final int CHECKED\_ITEM\_ID = 1;
private static final Item CHECKED\_ITEM = new ItemBuilder()
  .id(CHECKED\_ITEM\_ID)
  .checked()
  .build();
private static final Item UNCHECKED\_ITEM = new ItemBuilder()
  .id(2)
  .checked()
  .build();
private static final Item NEW\_ITEM = new ItemBuilder()
  .checked()
  .build();

I will also use a Mockito captor in one of my tests, which I will set up as a field as well:

private ArgumentCaptor anyItem = ArgumentCaptor.forClass(Item.class);

### Writing a test with Mockito and AssertJ

Writing tests with Mockito and AssertJ explains itself quite easily, take for example this test:

@Test
public void whenFindingItemsItShouldReturnAllItems() {
  // Given that the repository returns CHECKED\_ITEM and UNCHECKED\_ITEM
  given(repository.findAll()).willReturn(Arrays.asList(CHECKED\_ITEM, UNCHECKED\_ITEM));
  // When looking for all items
  assertThat(controller.findItems())
  // Then it should return the CHECKED\_ITEM and UNCHECKED\_ITEM 
  .containsOnly(CHECKED\_ITEM, UNCHECKED\_ITEM);
}

At the first line, we're providing some data to our mocks, so that when `repository.findAll()` is executed, it will return a list of both `CHECKED_ITEM` and `UNCHECKED_ITEM`.

Then the next step is the assertion. Given that our repository returns those items, it should mean that when we call `controller.findItems()`), it will contain only `CHECKED_ITEM` and `UNCHECKED_ITEM`.

Obviously, in real code a test will not be that easy, but still, this code makes so much sense, I could probably show it to my mother and she probably understands it as well... . Well, not entirely since she doesn't know what controllers and repositories are, but you get the point.

But most of our tests are just that simple, for example:

@Test
public void whenAddingItemItShouldReturnTheSavedItem() {
  // Given that a NEW\_ITEM is saved and flushed, a CHECKED\_ITEM is returned
  given(repository.saveAndFlush(NEW\_ITEM)).willReturn(CHECKED\_ITEM);
  // When adding a NEW\_ITEM
  assertThat(controller.addItem(NEW\_ITEM))
  // Then it should return the CHECKED\_ITEM
  .isSameAs(CHECKED\_ITEM);
}

@Test
public void whenUpdatingItemItShouldReturnTheSavedItem() {
  // Given that CHECKED\_ITEM is returned when one is requested with CHECKED\_ITEM\_ID
  given(repository.getOne(CHECKED\_ITEM\_ID)).willReturn(CHECKED\_ITEM);
  // Given that a CHECKED\_ITEM is saved and flushed, a CHECKED\_ITEM is returned
  given(repository.saveAndFlush(CHECKED\_ITEM)).willReturn(CHECKED\_ITEM);
  // When updating a CHECKED\_ITEM
  assertThat(controller.updateItem(CHECKED\_ITEM, CHECKED\_ITEM\_ID))
  // Then it should return the CHECKED\_ITEM
  .isSameAs(CHECKED\_ITEM);
}

### Verifying calls

However, sometimes this is not enough. Sometimes you want to **verify** that a specific method has been called. For example, if we take a look at the delete REST API, we notice that the method has a `void` signature, meaning that we can't simply test that something is correctly returned.

No, in this case you would like to check if the `delete()` function has been called on the repository. With Mockito, you can use the `verify()` method to verify that a specific method inside a mock has been called. For example:

@Test
public void whenDeletingAnItemItShouldUseTheRepository() {
  // Given that an item with CHECKED\_ITEM\_ID is removed
  controller.deleteItem(CHECKED\_ITEM\_ID);
  // Verify that the repository is used to delete the item
  verify(repository).delete(CHECKED\_ITEM\_ID);
}

The `verify()` method also allows you to provide specific matchers, for example:

verify(repository).delete(anyInt());

This piece of code will verify that the `delete()` method has been called with any integer.

But sometimes, you have a complex object, and you want to check if a certain property is filled. Well, if you use Mockito's `ArgumentCaptor`, that's no problem either. You can simply create a captor like this:

ArgumentCaptor captor = ArgumentCaptor.forClass(Type.class);

If you look back in the code we defined earlier, you will notice that we already defined an argument captor as a field inside the test case. With the `anyItem` captor, we can check any `Item` argument, for example:

@Test
public void whenAddingItemItShouldMakeSureNoIDIsPassed() {
  // Given that a CHECKED\_ITEM is added
  controller.addItem(CHECKED\_ITEM);
  // Verify that when the item is saved
  verify(repository).saveAndFlush(anyItem.capture());
  // It should have an empty ID
  assertThat(anyItem.getValue().getId()).isNull();
}

@Test
public void whenUpdatingItemItShouldUseTheGivenID() {
  // Given that CHECKED\_ITEM is returned when one is requested with CHECKED\_ITEM\_ID
  given(repository.getOne(CHECKED\_ITEM\_ID)).willReturn(CHECKED\_ITEM);
  // Given that a CHECKED\_ITEM with CHECKED\_ITEM\_ID is updated
  controller.updateItem(NEW\_ITEM, CHECKED\_ITEM\_ID);
  // Verify that when the item is saved
  verify(repository).saveAndFlush(anyItem.capture());
  // It should have the given CHECKED\_ITEM\_ID
  assertThat(anyItem.getValue().getId()).isEqualTo(CHECKED\_ITEM\_ID);
}

As you can see, with `anyItem.capture()` we can tell Mockito which argument we'd like to capture, and with `anyItem.getValue()` we can retrieve the actual object that was passed and use it for further assertions with AssertJ.

So, that's about it for this tutorial. In the next part of this series I will talk about executing JavaScript tests using Maven.

#### Achievement: Wrote unit tests using Mockito and AssertJ

Seeing this means you managed to read through this (short) tutorial about unit testing your code using Mockito and AssertJ. If you're interested in the full code example, you can find it on [GitHub](https://github.com/g00glen00b/ng-spring-boot/tree/feature-tests). If you want to try out the code yourself, you can download an archive from [GitHub](https://github.com/g00glen00b/ng-spring-boot/archive/feature-tests.zip).
