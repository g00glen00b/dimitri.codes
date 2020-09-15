---
title: "Uploading files with Spring and GraphQL"
date: "2020-05-05"
featuredImage: "../../images/logos/graphql.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "GraphQL"]
excerpt: "In this tutorial I'll cover how you can upload files using Spring boot and GraphQL."
---

So far, I've written several tutorials about using GraphQL with Spring boot.
One of the things I haven't covered yet though is the possibility to upload files.

While not officially part of the GraphQL specification, several vendors, including [Apollo](https://www.apollographql.com/) and the [Spring boot starter for GraphQL](https://github.com/graphql-java-kickstart/graphql-spring-boot) allow file uploads.

![GraphQL + Spring boot](images/graphql-spring-boot.png)

### Project setup

When setting up a Spring boot project with GraphQL, you have to make sure that you add the **web starter**:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

In addition, you also have to add the GraphQL starter (be aware, this is not a part of the Spring framework):

```xml
<dependency>
    <groupId>com.graphql-java-kickstart</groupId>
    <artifactId>graphql-spring-boot-starter</artifactId>
    <version>5.10.0</version>
</dependency>
```

Once all dependencies are in place, we can get started!

### Defining the schema

As mentioned before, file uploads aren't part of the GraphQL specification.
That means that, in order to make them work, we'll have to add a custom `Upload` scalar type.

To do this, create a new file called **src/main/resources/schema.graphql** and add the following to it:

```graphql
scalar Upload
```

Once that's done, you can use this type wherever you want.
For example, let's say we have an application that allows people to upload their own profile picture.
In that case, we could create a mutation like this:

```graphql
type Mutation {
  updateAvatar(avatar: Upload!): String
}
```

This schema means that we'll have an `updateAvatar` operation, that accepts a single parameter called `avatar` and returns the URL of where to access the profile picture.

Now that we have a proper schema, we can write some code.

### Creating the resolvers

To make our application properly work, we have to write a few resolvers.

First of all, we have to tell GraphQL how to resolve the `Upload` scalar we defined.
Luckily for us, this scalar is already implemented and ready to use.
All we have to do is to define a proper bean:

```java
@Bean
public GraphQLScalarType uploadScalar() {
    return ApolloScalars.Upload;
}
```

Behind the screens, this will fetch the multipart data from an HTTP request, and add it to the environment.
This allows us to properly access the files we need by accessing the environment within our resolvers.

To define a resolver for our `updateAvatar` mutation, we have to create a new class:

```java
@Component
public class MutationResolver implements GraphQLMutationResolver {
    // TODO: Implement
}
```

Then we can add the resolver itself:

```java
public String updateAvatar(Part avatar) {
    // TODO: Implement
}
```

Now, as I said before, the `ApolloScalars.Upload` will fetch the upload from the request and add it to the environment.
This means that we can't use the `avatar` parameter like we just added. The only reason we keep this is because the GraphQL schema has to properly match.

To actually access the file, we have to access it from the environment:

```java
public String updateAvatar(Part avatar, DataFetchingEnvironment environment) {
    Part actualAvatar = environment.getArgument("avatar");
    // TODO: Implement
}
```

Once that's done, you can actually use the `actualAvatar` to access the data.

### Scaling the avatar

Where you upload the file depends on your use case. Perhaps you want to upload it to an AWS S3 bucket, store it in a database or save it on the filesystem.

For the sake of having a complete implementation, here's how you could store it locally.

First of all, you probably want to make sure that these avatars are using certain dimensions (maximum width and height).
To do this, I'm going to use `ImageIO`:

```java
private BufferedImage scale(BufferedImage image) {
    int maxWidth = 200;
    int maxHeight = 200;
    if (image.getWidth() >= image.getHeight() && image.getWidth() > maxWidth) {
        int newHeight = (int) (image.getHeight() * ((float) maxWidth / image.getWidth()));
        return getBufferered(image.getScaledInstance(maxWidth, newHeight, BufferedImage.SCALE_SMOOTH), maxWidth, newHeight);
    } else if (image.getHeight() > image.getWidth() && image.getHeight() > maxHeight) {
        int newWidth = (int) (image.getWidth() * ((float) maxHeight / image.getHeight()));
        return getBufferered(image.getScaledInstance(newWidth, maxHeight, BufferedImage.SCALE_SMOOTH), newWidth, maxHeight);
    } else {
        return image;
    }
}
```

This method will scale a `BufferedImage` to a proper maximum width and height (in this case 200px by 200px).

### Determining the location on the filesystem

Since we're going to write to the filesystme, we also need to provide a proper location.
In this case, I want to write files to a folder relative to the application.
To do that, I'm going to autowire the `ResourceLoader` into our resolver:

```java
@Component
@RequiredArgConstructor
public class MutationResolver implements GraphQLMutationResolver {
    private final ResourceLoader resourceLoader;
}
```

I'm using [Lombok](https://projectlombok.org/) to actually create a proper constructor to autowire, but you can also define your own constructor.

To return a proper file, I also created the following method:

```java
private File getLocation(String filename) {
    File directory = resourceLoader.getResource("file:./filestorage/").getFile();
    return new File(directory, filename);
}
```

This method will return a proper `File` within the **./filestorage/** folder, using the filename we passed to it.

### Determining the file type

In addition, we also have to determine the type of the image. To do this, I'm going to read the media type from the request:

```java
private String getType(String mimetype) {
    MediaType mediaType = MediaType.parseMediaType(mimetype);
    if (!isImage(mediaType)) throw new InvalidPersonAvatarException("Invalid content-type");
    else if (isJpeg(mediaType)) return "jpg";
    else return mediaType.getSubtype();
}

private boolean isJpeg(MediaType mediaType) {
    return "jpeg".equalsIgnoreCase(mediaType.getSubtype());
}

private boolean isImage(MediaType mediaType) {
    return "image".equalsIgnoreCase(mediaType.getType());
}
```

For example, if the mediatype was `image/png`, this will return `png`.
It will also throw an exception for different kind of data, such as `application/json`.

### Locally storing images

We can now throw this together in our resolver to properly upload files:

```java
public String updateAvatar(Part avatar, DataFetchingEnvironment environment) {
    Part actualAvatar = environment.getArgument("avatar");
    BufferedImage actualImage = ImageIO.read(actualAvatar.getInputStream());
    BufferedImage scaledImage = scale(actualImage);
    String type = getType(actualAvatar.getContentType());
    File location = getLocation("foo." + type);
    ImageIO.write(scaled, type, location);
    return "http://localhost:8080/avatar/foo." + type;
}
```

This piece of code will retrieve the image, scale it, and store it locally.
If the incoming file was a PNG file, it will be stored within **./filestorage/foo.png**.

The last line within this method returns the URL of where we can access the image.
However, we still have to tell Spring boot to look for files within the filestorage folder when we call an URL starting with **/avatar/**.

To do this, we can define a custom `WebMvcConfigurer`:

```java
@EnableWebMvc
@Configuration
public class PersonAvatarConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
            .addResourceHandler("/avatar/**")
            .addResourceLocations("file:./filestorage/");
    }
}
```

### Using it with Apollo and React

Testing this out will be a bit more difficult.
As mentioned before, file uploads are not a part of the GraphQL specification, and thus, can't be easily configured within GraphiQL.
Currently, I've only been able to properly test this through [Postman](https://www.postman.com/).

If you plan on using it with React, you can do this by using the [`apollo-upload-client`](https://github.com/jaydenseric/apollo-upload-client) library:

```
npm install apollo-upload-client
```

Now you can replace your existing Apollo HTTP link by using:

```js
import {createUploadLink} from 'apollo-upload-client';

const httpLink = createUploadLink({uri: `http://localhost:8080/graphql`});
```

After that, you could write a React component like this to test it out:

```jsx
const updateAvatarMutation = gql`
  mutation ($avatar: Upload!) {
    updateAvatar(avatar: $avatar)
  }
`;

const [update] = useMutation(updateAvatarMutation);

return <input
  type="file"
  placeholder="Choose a file"
  onChange={({target: {files: [file]}}) => update({variables: {avatar: file}})}/>;
```

This code would show a simple file input type, and call the `updateAvatar` mutation as soon as a file is chosen.

A full code example can be found on [GitHub](https://github.com/g00glen00b/whoiswho-graphql).


