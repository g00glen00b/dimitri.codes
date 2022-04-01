---
title: "Mapping beans with MapStruct"
featuredImage: "../../../images/logos/mapstruct.png"
categories: ["Java", "Tutorials"]
tags: ["MapStruct", "Maven", "Spring"]
excerpt: "Object mapping is a common practice in developing apps when you need to get across the different tiers. MapStruct is a framework for mapping objects."
---

Recently, I wrote several tutorials about [Spring boot](http://projects.spring.io/spring-boot/) and [Spring Data](http://projects.spring.io/spring-data/) JPA. A common issue that appears when writing large applications is that you don't want to use your entities on your front-end. The reason behind this is that your entity usually resembles how your database and your tables look like, while your model or your DTO could be entirely different.

To convert your data from one type to another there are various frameworks. I've used [Dozer](http://dozer.sourceforge.net/) quite often in the past, but [MapStruct](http://mapstruct.org/) seems to be gaining popularity (and maturity) as well.

### Project setup

To be able to use MapStruct, you need to add two things:

- A Maven dependency with the MapStruct API (annotations, ...)
- A Maven plugin that generates implementations for your mappers

To do that, open your **pom.xml** and add the following to your dependencies:

```xml
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct-jdk8</artifactId>
    <version>1.0.0.Final</version>
</dependency>
```

And finally, add the following to your `<plugins>` section:

```xml
<plugin>
    <groupId>org.bsc.maven</groupId>
    <artifactId>maven-processor-plugin</artifactId>
    <version>2.2.4</version>
    <configuration>
        <defaultOutputDirectory>
            ${project.build.directory}/generated-sources
        </defaultOutputDirectory>
        <processors>
            <processor>org.mapstruct.ap.MappingProcessor</processor>
        </processors>
    </configuration>
    <executions>
        <execution>
            <id>process</id>
            <phase>generate-sources</phase>
            <goals>
                <goal>process</goal>
            </goals>
        </execution>
    </executions>
    <dependencies>
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct-processor</artifactId>
            <version>1.0.0.Final</version>
        </dependency>
    </dependencies>
</plugin>
```

If you're like me and you worked with Dozer for a while, you might be confused at first. Dozer is also a mapping framework, but only requires you to add a dependency. The main difference between MapStruct and Dozer is that Dozer does not generate code, it has a very simple Java API, quite some configuration and uses a lot of reflection behind the screens.

MapStruct on the other hand uses annotations + interface based API, and the plugin generates the code, based on that interface, not at runtime, but at compile time. The main reason for this is (at least I think so), is because MapStruct does not use reflection, but simply uses getters and setters to map the objects.

Personally I like the fact that it doesn't use reflection, but creates code that could be written by yourself quite easily. However, the code creation has a "dark" side as well, meaning that you have to execute an additional step (code generation at compile time) and currently there is no support for immutable properties either, because the main way to access those is through reflection or having a custom constructor (which isn't supported so far).

If you're using Eclipse you might have to add the **target/generated-sources** folder to your build path.

### Creating our DTOs

Now, for the next step we're going to create some DTOs. I'm going to be using the same entity as in my last few tutorials. This would be the `Superhero` entity to start from:

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

The changes compared to the old Thymeleaf template is that I'm using `${hero.identity.firstName + ' ' + hero.identity.lastName}` and that I'm using `${hero.alignment.name() == 'GOOD'}` to validate if the hero is on the good side or not.

Obviously the HTML could be improved now. In stead of showing the first- and lastname of the identity apart, we could create a method to show them both, for example `getFullname()` or something likewise.

For the DTO's on the other hand I'm going to be using some nested objects. In stead of having one flat object representing the superhero, I'm going to create a `SuperheroDTO` which has a `SuperheroIdentityDTO` containing the identity of the superhero (which is the `firstName` and `lastName` fields in our entity).

In stead of a boolean to represent `good` I'm going to be using an enum called `SuperheroAlignmentDTO`, containing the values `GOOD` and `EVIL`.

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
    public void setId(Long id) {
        this.id = id;
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

As you can see I wrote a setter for the id-property, as explained before, support for immutable properties is not yet implemented.

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

public enum SuperheroAlignmentDTO {
    GOOD, EVIL;
}
```

I'm also going to change my HTML view (**superheroes.html**) already to resemble these DTO's:

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

### Writing a mapper

A mapper in MapStruct is quite simple, all you have to do is to create a simple interface like this:

```java
@Mapper
public interface SuperheroMapper {
    SuperheroDTO toSuperheroDTO(Superhero superhero);
}
```

If we want to enable Spring support, we have to use the `@Mapper(componentModel = "spring")` annotation.

Obviously we have some special cases that we have to handle as well. First of all we want to map a boolean to an enum (`good` to `alignment`). To do that you have to create your own mapper implementation. So create a class called `SuperheroAlignmentMapper`, which should look like this:

```java
@Component
public class SuperheroAlignmentMapper {

    public SuperheroAlignmentDTO toAlignment( boolean good) {
        if (good) {
            return SuperheroAlignmentDTO.GOOD;
        } else {
            return SuperheroAlignmentDTO.EVIL;
        }
    }
}
```

Notice that we made this mapper available as a Spring bean, using `@Component`. Because we defined the component model of the `SuperheroMapper` to be **spring**, you have to create Spring beans for these mappers.

Now, back to the `SuperheroMapper`, we have to mention that this mapper uses the `SuperheroAlignmentMapper`we just defined. To do that, we can simply alter the `@Mapper` annotation:

```java
@Mapper(uses = { SuperheroAlignmentMapper.class }, componentModel = "spring")
public interface SuperheroMapper {
    // ...
}
```

We also have to hint that the `toSuperheroDTO` method should convert `good` to `alignment`, which you can do using the `@Mapping` annotation:

```java
@Mappings({
    @Mapping(source = "good", target = "alignment"),
})
SuperheroDTO toSuperheroDTO(Superhero superhero);
```

The next step is to create the `identity`. The issue here is that we want to convert two properties to a single object, containing those properties.

To do that, you can use the expression language that comes with MapStruct:

```java
@Mappings({
    @Mapping(source = "good", target = "alignment"),
    @Mapping(target = "identity", expression = "java(new be.g00glen00b.dto.SuperheroIdentityDTO(superhero.getFirstName(), superhero.getLastName()))")
})
SuperheroDTO toSuperheroDTO(Superhero superhero);
```

As you can see here, I'm using the constructor I made for `SuperheroIdentityDTO`.

Lastly, if you want to map a collection of `Superhero`'s to a collection of `SuperheroDTO`s, you can do that easily by adding another method to your mapper:

```java
List<SuperheroDTO> toSuperheroDTOs(List<Superhero> superheroes);
```

With that in place we're ready to map some entities!

### Wrapping your repository in a service

Something I've done in some of my tutorials already is to wrap the repository call in a service, which makes it easier to encapsulate it and add the mapper to it:

```java
@Service
public class SuperheroServiceImpl implements SuperheroService {
    @Autowired
    private SuperheroRepository repository;
    @Autowired
    private SuperheroMapper mapper;

    @Override
    public List<SuperheroDTO> findAll() {
        return mapper.toSuperheroDTOs(repository.findAll());
    }
}
```

As you can see, mapping the entities to the DTO's is quite easily. However, don't forget to build your code, because the mapper implementation by MapStruct is only generated thanks to the Maven plugin we added.

### Comparison to Dozer

MapStruct is a great framework. It doesn't use reflection to access fields/getters or setters, but generates code. The good thing is that the code it generates is pretty clean. For example if I take a look at the **target/generated-sources** folder, I can see the mapper implementation, which looks like:

```java
@Component
public class SuperheroMapperImpl implements SuperheroMapper {

    @Autowired
    private SuperheroAlignmentMapper superheroAlignmentMapper;

    @Override
    public SuperheroDTO toSuperheroDTO(Superhero superhero) {
        if ( superhero == null ) {
            return null;
        }

        SuperheroDTO superheroDTO = new SuperheroDTO();

        superheroDTO.setId( superhero.getId() );
        superheroDTO.setAlignment( superheroAlignmentMapper.toAlignment( superhero.isGood() ) );
        superheroDTO.setName( superhero.getName() );

        superheroDTO.setIdentity( new be.g00glen00b.dto.SuperheroIdentityDTO(superhero.getFirstName(), superhero.getLastName()) );

        return superheroDTO;
    }

    @Override
    public List<SuperheroDTO> toSuperheroDTOs(List<Superhero> superheroes) {
        if ( superheroes == null ) {
            return null;
        }

        List<SuperheroDTO> list = new ArrayList<SuperheroDTO>();
        for ( Superhero superhero : superheroes ) {
            list.add( toSuperheroDTO( superhero ) );
        }

        return list;
    }
}
```

This is pretty readable, and if you ever decide to drop MapStruct, you still have some pretty code that works without any framework. However, the disadvantage of this in my opinion is that you have to generate code. Another disadvantage of MapStruct is that it currently has no support for immutable fields (through constructors for example?), which is a big bummer because I use them most of the time. [Here](https://github.com/mapstruct/mapstruct/issues/73) is a ticket that is worth following if you want this feature as well.

#### Achievement: Mastered MapStruct

If you’re seeing this, then it means you successfully managed to make it through this article. If you’re interested in the full code example, you can find it on [GitHub](https://github.com/g00glen00b/spring-samples/tree/master/spring-boot-jpa-mapstruct-webapp).
