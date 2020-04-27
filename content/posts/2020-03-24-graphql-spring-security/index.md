---
title: "Securing your GraphQL API with Spring Security"
date: "2020-03-24"
featuredImage: "../../images/logos/graphql.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "GraphQL", "Spring security"]
excerpt: "In this tutorial, I'll show how you can use Spring Security with Spring boot and GraphQL."
---

[A while ago](/graphql-spring-boot/), I wrote a tutorial about developing a GraphQL API with Spring boot. In this tutorial, I'll show you how you can add security to your API.

![GraphQL + Spring boot](images/graphql-spring-boot.png)

### Project setup

To get started, we need both the **Web** and **Security** starters within our project:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

In addition, I'll also be using the **GraphQL Spring boot starter** to create a GraphQL API with Spring boot:

```xml
<dependency>
    <groupId>com.graphql-java-kickstart</groupId>
    <artifactId>graphql-spring-boot-starter</artifactId>
    <version>5.10.0</version>
</dependency>
```

To authenticate within our API, I'll use **JSON Web Tokens** (JWT), so I also added a JWT library:

```xml
<dependency>
    <groupId>com.auth0</groupId>
    <artifactId>java-jwt</artifactId>
    <version>3.8.3</version>
</dependency>
```

Once that's done, we're ready to go!

### Picking the right algorithm

The first step, is to create some beans that we'll use within our security configuration. Since I'll be using JWT, I also have to specify which algorithm I want to use to secure my tokens. In this example, I'll use **HMAC256**, so I defined the following bean:

```java
@Bean
public Algorithm jwtAlgorithm() {
    return Algorithm.HMAC256("my-JWT-secret");
}
```

As you can see, we also have to specify a secret key, which in my case will be `"my-JWT-secret"`. In practice, you probably want a stronger secret, and you may want to move it to a separate properties file.

The next step is to set up a `JWTVerifier`. This class can be used to verify if a token is signed with the right algorithm and secret, and if the payload matches your expectations (eg. is the expiry date and the issuer correct, ...). In my case, I'll use the algorithm I just defined, and verify that the issuer is my own API:

```java
@Bean
public JWTVerifier verifier(Algorithm algorithm) {
    return JWT
        .require(algorithm)
        .withIssuer("my-graphql-api")
        .build();
}
```

The final bean I'll create is an `AuthenticationProvider`. The way this is defined depends on where you store your user credentials (LDAP, database, in memory, ...). In my case, I'll use a database to store my credentials:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(10);
}


@Bean
public AuthenticationProvider authenticationProvider(UserService userService, PasswordEncoder passwordEncoder) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(userService);
    provider.setPasswordEncoder(passwordEncoder);
    return provider;
}
```

I won't be going into much detail though, since that's material for another tutorial and isn't tied to GraphQL.

### Setting up a request filter

The way users will authenticate is by calling a specific mutation within our GraphQL API which will verify the credentials passed by the user, and will return a proper JSON Web Token.  
This token will then be passed as a header, such as `Authorization: Bearer <the token>`.

To verify that the token is valid, I'll use a custom filter:

```java
@Component
@RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final Pattern BEARER_PATTERN = Pattern.compile("^Bearer (.+?)$");
    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws IOException, ServletException {
        getToken(request)
            .map(userService::loadUserByToken)
            .map(userDetails -> JWTPreAuthenticationToken
                .builder()
                .principal(userDetails)
                .details(new WebAuthenticationDetailsSource().buildDetails(request))
                .build())
            .ifPresent(authentication -> SecurityContextHolder.getContext().setAuthentication(authentication));
        filterChain.doFilter(request, response);

    }

    private Optional<String> getToken(HttpServletRequest request) {
        return Optional
            .ofNullable(request.getHeader(AUTHORIZATION_HEADER))
            .filter(not(String::isEmpty))
            .map(BEARER_PATTERN::matcher)
            .filter(Matcher::find)
            .map(matcher -> matcher.group(1));
    }
```

This filter will parse the token from the headers, and set up a proper authentication by using [`WebAuthenticationDetailsSource`](https://docs.spring.io/spring-security/site/docs/4.2.13.RELEASE/apidocs/org/springframework/security/web/authentication/WebAuthenticationDetailsSource.html). This object is then wrapped within a `PreAuthenticatedAuthenticationToken` class, which is stored within the `SecurityContext`. To do this, I created a custom implementation of `PreAuthenticatedAuthenticationToken`:

```java
@Getter
public class JWTPreAuthenticationToken extends PreAuthenticatedAuthenticationToken {

    @Builder
    public JWTPreAuthenticationToken(JWTUserDetails principal, WebAuthenticationDetails details) {
        super(principal, null, principal.getAuthorities());
        super.setDetails(details);
    }

    @Override
    public Object getCredentials() {
        return null;
    }
}
```

The way `userService.loadByToken()` works is by verifying the token using the `JWTVerifier` we defined earlier:

```java
private Optional<DecodedJWT> getDecodedToken(String token) {
    try {
        return Optional.of(verifier.verify(token));
    } catch(JWTVerificationException ex) {
        return Optional.empty();
    }
}
```

We can then fetch our user information and set up a [`UserDetails`](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/core/userdetails/UserDetails.html) object:

```java
@Transactional
public JWTUserDetails loadUserByToken(String token) {
    return getDecodedToken(token)
        .map(DecodedJWT::getSubject)
        .flatMap(repository::findByEmail)
        .map(user -> getUserDetails(user, token))
        .orElseThrow(BadTokenException::new);
}
```

But as I mentioned before, this largely depends on where your users are stored. You could even put all details necessary onto the token as custom claims, and read them from the token itself.

Once we've set up the filter, we can set up Spring Security to add the filter to the chain:

```java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
@EnableConfigurationProperties(SecurityProperties.class)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
    private final AuthenticationProvider authenticationProvider;
    private final JWTFilter jwtFilter;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) {
        auth.authenticationProvider(authenticationProvider);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
            .anyRequest().permitAll()
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .addFilterBefore(jwtFilter, RequestHeaderAuthenticationFilter.class); // Filter
    }
}
```

In addition to adding the filter, we also pass the `AuthenticationProvider` bean we defined before. Also, since GraphQL only exposes a single endpoint, and some queries will require authentication and some don't, we configured Spring Security to permit all.

### Logging in

To allow people to log in using their username and password, I defined a custom mutation:

```graphql
type Mutation {
    login(email: String!, password: String!): User
}

type User {
    token: String
    person: Person
}
```

This also means we have to define a custom `MutationResolver` to handle the login:

```java
@Component
@RequiredArgsConstructor
public class MutationResolver implements GraphQLMutationResolver {
    private final UserService userService;
    private final AuthenticationProvider authenticationProvider;

    @PreAuthorize("isAnonymous()")
    public User login(String email, String password) {
        UsernamePasswordAuthenticationToken credentials = new UsernamePasswordAuthenticationToken(email, password);
        try {
            SecurityContextHolder.getContext().setAuthentication(authenticationProvider.authenticate(credentials));
            return userService.getCurrentUser();
        } catch (AuthenticationException ex) {
            throw new BadCredentialsException(email);
        }
    }
}
```

In this mutation resolver, we're using the `AuthenticationProvider` again to see if a user passed the right username and password. Since we should only be able to do this when we're not logged in yet, I added the `@PreAuthorize("isAnonymous()")` annotation to this method.

In addition to setting up the Spring Security part, I'm also returning a custom `User` object. This is what we'll expose to consumers of our API, and could contain useful information about the current user such as their name, a profile picture and so on.

We will add a custom resolver which will return the token for the user though:

```java
@Component
@RequiredArgsConstructor
public class UserResolver implements GraphQLResolver<User> {
    private final UserService service;

    @PreAuthorize("isAuthenticated()")
    public String getToken(User user) {
        return service.getToken(user);
    }
}
```

Now we can generate our token, such as:

```java
@Transactional
public String getToken(User user) {
    Instant now = Instant.now();
    Instant expiry = Instant.now().plus(Duration.ofHours(2)); // Token will be valid for 2 hours
    return JWT
        .create()
        .withIssuer("my-graphql-api") // Same as within the JWTVerifier
        .withIssuedAt(Date.from(now))
        .withExpiresAt(Date.from(expiry))
        .withSubject(user.getEmail())
        .sign(algorithm); // Same algorithm as within the JWTVerifier
}
```

With that, we can successfully log in by calling the login-mutation, and we can authenticate ourself for further API calls by passing the token as the `Authorization` header.

### Authorization

As we've seen before, we configured Spring Security to permit everyone to call the GraphQL API. To be able to require authorization for specific operations, we can use the `@PreAuthorize` annotation like before.

For example, let's say we have an `updatePassword` operation. This operation should only be allowed for people who are authenticated, and thus we could annotate our mutation resolver like this:

```java
@PreAuthorize("isAuthenticated()")
public User updatePassword(UpdatePasswordInput input) {
    return userService.updatePassword(userService.getCurrentUser().getPersonId(), input);
}
```

In addition, if an operation requires certain role, we could do something like this:

```java
@PreAuthorize("hasAuthority('ADMIN')")
public StudyMaterial approveStudyMaterial(long studyMaterialId) {
    return studyMaterialService.approve(studyMaterialId, true);
}
```

In this case, only admins are allowed to approve certain things, and thus, we're using the `hasAuthority()` method to verify this.

The major downside to this approach is that our schema is still public and I haven't found a way to filter the schema itself. This means that people checking out the schema will know that there are certain operations, even if they can't access them.

In addition, it doesn't seem that GraphiQL doesn't support setting HTTP headers. That means that if you want to test out the API, you'll have to rely on other GraphQL clients such as [GraphQL Playground](https://github.com/prisma-labs/graphql-playground) or [Postman](https://www.postman.com/).

Knowing that, we're now fully able to add security to the GraphQL APIs we create with Spring.
