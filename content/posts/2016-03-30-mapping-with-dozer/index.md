---
title: "Mapping with Dozer"
date: "2016-03-30"
featuredImage: "../../images/logos/dozer.png"
categories: ["Java", "Tutorials"]
tags: ["Dozer", "Java", "Spring"]
excerpt: "Dozer is a simple bean mapping framework, which allows you to convert an object of a specific type, to an object of another type."
---

Recently I wrote a tutorial about [mapping with MapStruct](/mapstruct/). Testing it out for the first time, I noticed several differences between MapStruct and the mapping framework that I have the most experience in, called [Dozer](http://dozer.sourceforge.net/). That's why I'm going to make a similar tutorial to my previous one, utilizing the Dozer framework this time, allowing you to properly make your own conclusion about which mapping framework you'll choose.

Dozer is a simple bean mapping framework, which allows you to convert an object of a specific type, to an object of another type. This can be particularly interesting if you start working with entities and you're trying to convert them to DTOs.

### Project setup

In this tutorial I will be going further again upon the [JPA tutorial](/spring-data-jpa/) I recently wrote. First thing we have to do is to add Dozer as a dependency:

```xml
<dependency>
    <groupId>net.sf.dozer</groupId>
    <artifactId>dozer</artifactId>
    <version>5.5.1</version>
</dependency>
```

Dozer does not use code generation, so no plugins are required. However, Dozer does use a configuration file, either XML, or using a Java API (or even annotations). I like the Java configuration, so I'm going to stick with that.

To do that, you can create a new class called `MappingConfig` and annotate it with the `@Configuration` annotation so it gets picked up by Spring:

```java
@Configuration
public class MappingConfig {
    // ...
}
```

Before we actually start configuring, let's create the entities and the DTOs if you didn't do that yet.

The `Superhero` entity is quite simple. I defined 5 fields:

- An auto-generated ID
- The first name of the superhero
- The last name of the superhero
- The superhero name
- A boolean to indicate whether or not the superhero is good (otherwise it is probably a supervillain)

The class to represent this is:

```java
@Entity
@Table(name = "superhero")
public class Superhero {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id")
    private Long id;
    @Column(name = "first_name")
    private String firstName;
    @Column(name = "last_name")
    private String lastName;
    @Column(name = "name")
    private String name;
    @Column(name = "good")
    private boolean good;

    public Long getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public boolean isGood() {
        return good;
    }
    public void setGood(boolean good) {
        this.good = good;
    }
}
```

Important to note is that I did not define a setter for the `id` field since it should not be updated. Now, for the DTOs I tried to bring more depth into the types, for example, for the firstname + lastname I created a separate DTO called `SuperheroIdentityDTO`:

```java
public class SuperheroIdentityDTO {
    private String firstName;
    private String lastName;

    public SuperheroIdentityDTO(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public SuperheroIdentityDTO() {
    }

    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}
```

In stead of simply having a boolean indicating if the superhero is good or not, I created an enum called `SuperheroAlignmentDTO`:

```java
public enum SuperheroAlignmentDTO {
    GOOD, EVIL;
}
```

Everything together, this is `SuperheroDTO`:

```java
public class SuperheroDTO {
    private Long id;
    private String name;
    private SuperheroIdentityDTO identity;
    private SuperheroAlignmentDTO alignment;

    public SuperheroDTO(Long id, String name, SuperheroIdentityDTO identity, SuperheroAlignmentDTO alignment) {
        this.id = id;
        this.name = name;
        this.identity = identity;
        this.alignment = alignment;
    }

    public SuperheroDTO() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public SuperheroIdentityDTO getIdentity() {
        return identity;
    }
    public void setIdentity(SuperheroIdentityDTO identity) {
        this.identity = identity;
    }

    public SuperheroAlignmentDTO getAlignment() {
        return alignment;
    }
    public void setAlignment(SuperheroAlignmentDTO alignment) {
        this.alignment = alignment;
    }
}
```

Notice that we do not have a setter for the **id** field. The reason is the same as with the entity, there is no case where the ID should be updated. If you want to create a new DTO with an ID, you have to use the constructor to mutate the field.

### Configuring the mapper

Back to the `MappingConfig` now. The first thing we have to do in our configuration class is to define the `BeanMappingBuilder` bean, as explained in the [documentation](http://dozer.sourceforge.net/documentation/apimappings.html).

The primary use for this bean is to define which mappings should occur. In this case we want to be able to map `Superhero` objects to `SuperheroDTO` objects. The most easy setup for that would be:

```java
@Bean
public BeanMappingBuilder beanMappingBuilder() {
    return new BeanMappingBuilder() {
        @Override
        protected void configure() {
            mapping(Superhero.class, SuperheroDTO.class);
        }
    };
}
```

### Deep mapping

If your fields are mappable 1 by 1 and they have the same name, then this is all you need. In our case, the **name** property will already be converted.

However, the **firstName** and **lastName** properties cannot be automatically converted, because they are wrapped inside `SuperheroIdentityDTO`. To do these "deep mappings", you have to use the dotted syntax, for example:

```java
mapping(Superhero.class, SuperheroDTO.class)
    .fields("firstName", "identity.firstName")
    .fields("lastName", "identity.lastName");
```

### Accessing immutable fields

The next field that won't be converted automatically is the **id** property. While there is certainly a field for this property in both classes, there is no setter in `SuperheroDTO`, so it won't find that field properly. To indicate that the field should be accessed directly, in stead of defining the properties as simple strings (for example `"id"`), you have to create a `FieldDefinition` like this:

```java
mapping(Superhero.class, SuperheroDTO.class)
    .fields("firstName", "identity.firstName")
    .fields("lastName", "identity.lastName")
    .fields(field("id").accessible(), field("id").accessible());
```

In this example it would suffit if we provided the `FieldDefinition` for the `SuperheroDTO` only, but mappings are by default bi-directional in Dozer (though it can be configured).

### Custom converters

The last property is the **alignment**. This is a bit more difficult, because Dozer has no way to know how `true` translates to `SuperheroAlignmentDTO.GOOD` and `false` translates to `SuperheroAlignmentDTO.EVIL`. However, we can help Dozer a bit by defining a custom converter.

A custom converter in Dozer allows you to do custom type mappings. Dozer already knows how to map various types, mostly conversions between date-type fields. For example, mapping a `java.sql.Date` to a `java.util.Date` should be possible out of the box.

To create a custom converter you have to create a class and make it extend from `DozerConverter`. This class allows generic types to define the class to be converted from and the class to be converted to. For example:

```java
public class BooleanSuperheroAlignmentConverter extends DozerConverter<Boolean, SuperheroAlignmentDTO> {
    // ...
}
```

This abstract class requires you to implement two methods:

```java
@Override
public SuperheroAlignmentDTO convertTo(Boolean source, SuperheroAlignmentDTO destination) {
    if (source == null) {
        return null;
    } else if (source) {
        return SuperheroAlignmentDTO.GOOD;
    } else {
        return SuperheroAlignmentDTO.EVIL;
    }
}

@Override
public Boolean convertFrom(SuperheroAlignmentDTO source, Boolean destination) {
    if (source == null) {
        return null;
    } else {
        return SuperheroAlignmentDTO.GOOD.equals(source);
    }
}
```

The next thing you have to do is to create a constructor. The `DozerConverter` does not have a default constructor, which means that, if we want to have a default constructor, we have to call the overloaded constructor of `DozerConverter`, for example:

```java
public BooleanSuperheroAlignmentConverter() {
    super(Boolean.class, SuperheroAlignmentDTO.class);
}
```

Back to the `MappingConfig` we have to define the mapping of the field **good** into the aligment field using this custom converter. To do that, you write the following:

```java
mapping(Superhero.class, SuperheroDTO.class)
    .fields("firstName", "identity.firstName")
    .fields("lastName", "identity.lastName")
    .fields(field("id").accessible(), field("id").accessible())
    .fields("good", "alignment", customConverter(BooleanSuperheroAlignmentConverter.class));
```

To tell Dozer to use a specific custom converter, you can use the `customConverter()` method. This is a static method from `FieldsMappingOptions`, so I use static imports for these.

import static org.dozer.loader.api.FieldsMappingOptions.customConverter;

That's about it for the Dozer configuration. All we have to do now is to create a `DozerBeanMapper` bean and use the builder with it:

```java
@Bean
public DozerBeanMapper beanMapper() {
    DozerBeanMapper dozerBeanMapper = new DozerBeanMapper();
    dozerBeanMapper.addMapping(beanMappingBuilder());
    return dozerBeanMapper;
}
```

### Using Dozer

Now that we have configured Dozer so that it knows how to map `Superhero` to `SuperheroDTO`, it's time to use the mapper.

First of all you have to autowire it in the class you need it in. I wrote a separate service to return the superheroes, so this is what I did:

```java
@Service
public class SuperheroServiceImpl implements SuperheroService {
    @Autowired
    private SuperheroRepository repository;
    @Autowired
    private DozerBeanMapper mapper;

    @Override
    public List<SuperheroDTO> findAll() {
        // TODO
    }
}
```

Sadly, the `DozerBeanMapper` does not allow you to map collections immediately, so you'll have to either loop over it or if you're using Java 8 you can use streams and lambdas:

```java
@Override
public List<SuperheroDTO> findAll() {
    return repository.findAll().stream()
        .map(entity -> mapper.map(entity, SuperheroDTO.class))
        .collect(Collectors.toList());
}
```

That's everything you really have to do. I also changed my HTML template a bit so that it matches the new DTO in stead of the entity structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" />
</head>
<body>
<div class="container">
  <table class="table">
    <thead>
    <tr>
      <th>#</th>
      <th>Hero name</th>
      <th>Real name</th>
      <th>Good</th>
    </tr>
    </thead>
    <tbody>
    <tr th:each="hero, status : ${superheroes}">
      <td th:text="${status.count}">1</td>
      <td th:text="${hero.name}">Hero name</td>
      <td th:text="${hero.identity.firstName + ' ' + hero.identity.lastName}">Real name</td>
      <td>
        <span class="glyphicon glyphicon-ok" th:if="${hero.alignment.name() == 'GOOD'}"></span>
        <span class="glyphicon glyphicon-remove" th:if="${hero.alignment.name() == 'EVIL'}"></span>
      </td>
    </tr>
    </tbody>
  </table>
</div>
</body>
</html>
```

The main differences here are the `${hero.identity.firstName + ' ' + hero.identity.lastName}` in stead of `${hero.firstName + ' ' + hero.lastName}` and the comparison of `${hero.alignment.name() == 'GOOD'}` to verify if it's a hero or a villain.

### What mapping framework should I choose?

So now that the entire application has been refactored to use Dozer similarly to how we did it in the article about MapStruct, we can make a conclusion now.

Both frameworks are great and have similar features. One feature I think MapStruct is lacking are immutable properties. Properties like the **id** in this article are not yet mappable through MapStruct.

On the other hand, if you take a look at both Github repositories, you can see that MapStruct has **a lot** more activity. The most recent commit on the Dozer repository is more than half of a year ago, while the most recent commit on the MapStruct repository is is quite recently. I also got a response quite fast from the MapStruct community when I published my latest post, mentioning the "shortcomes".

If all you're looking for is a mapping framework, it's probably more a question about what your personal favour is. Putting it bluntly, choosing between MapStruct and Dozer is choosing between vanilla code generation vs reflection or annotations vs API configuration. If you're asking me what my preference is, well, then it's Dozer, but it's nothing more than a preference, it's certainly not a recommendation.

#### Achievement: Got your daily dose of Dozer

If you’re seeing this, then it means you successfully managed to make it through this article. If you’re interested in the full code example, you can find it on [GitHub](https://github.com/g00glen00b/spring-samples/tree/master/spring-boot-jpa-dozer-webapp).
