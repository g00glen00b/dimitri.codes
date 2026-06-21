---
title: "Prevent silently breaking your API's with contract testing"
excerpt: "Library upgrades can silently break your API contracts. Here's how to catch that with OpenAPI-Diff, Spring Cloud Contract, and Pact."
featuredImage: "/logos/open-api.png"
categories: ["Java", "Tutorials"]
tags: ["Spring Boot", "Spring", "Testing", "REST", "OpenAPI", "Pact"]
---

## What is contract testing?

Imagine you wrote a REST API with actual consumers.
After a while, you upgrade some libraries, deploy a new version and ... poof... your consumers no longer work.
This is one of the few examples of an API breaking its contract with its consumers.

Library updates (eg. Jackson), configuration changes, new features, ... . This can happen in several ways, some more obvious than others.
The only way to mitigate this is to explicitly define your API contract and test against it, this is what we call **contract testing**.

![Schematic of an "API Contract" between a "Provider" and a "Consumer"](./images/api-contract.png)

### Provider-driven vs consumer-driven

In the schema above, you can see the API contract is in between the provider and the consumer.
Usually, one of these sides maintains the API contract, while the other one imports it.

If the consumer maintains the API contract, we call it **Consumer-driven contract testing**.
This is ideal if you have control over your consumers so you can ask them to maintain the API contract.

**Provider-driven contract testing** on the other hand is usually easier to set up, and is also the better option if you have no control over your consumers, for example if you're developing a public API.

In this blogpost I'll show three tools:

1. [Provider-driven contract testing with OpenAPI-Diff](#provider-driven-testing-with-openapi-diff)
2. [Provider-driven contract testing with Spring Cloud Contract](#provider-driven-testing-with-spring-cloud-contract)
3. [Consumer-driven contract testing with Pact](#consumer-driven-contract-testing-with-pact)

## Provider-driven testing with OpenAPI-Diff

The [OpenAPI specification](https://swagger.io/specification/) is a widely adopted format for describing REST APIs.
Because of its popularity, it makes sense to check whether we can use this for contract testing.

![Example of a visualized OpenAPI specification](./images/openapi-spec.png)

One option is to use [OpenAPI-Diff](https://github.com/OpenAPITools/openapi-diff).
While this isn't exactly a contract testing library, it can be used to verify if your current OpenAPI specification matches a previously agreed upon specification.
OpenAPI-Diff has several tools such as a Maven plugin, but I chose to write a JUnit test and use the core dependency:

```xml
<dependency>
    <groupId>org.openapitools.openapidiff</groupId>
    <artifactId>openapi-diff-core</artifactId>
    <version>2.1.5</version>
    <scope>test</scope>
</dependency>
```

The next step is to write the test itself.
If you don't want to fully load your Spring Boot context, I suggest writing a `@WebMvcTest` and import all controllers:

```java
@WebMvcTest(controllers = {
    OrderController.class
})
@ImportAutoConfiguration({
    SpringDocConfiguration.class,
    SpringDocConfigProperties.class,
    SpringDocWebMvcConfiguration.class,
    SpringDocPageableConfiguration.class
})
class OpenApiSnapshotTest {
    // TODO: Implement
}
```

The downside is that you'll need to manually include the Springdoc-related configuration classes.
Now, the next step is to write our test.
To obtain the live OpenAPI specification, you could make a request to `/v3/api-docs`, but I chose to inject the `OpenApiWebMvcResource` bean itself.
This bean contains the logic to create an `OpenAPI` object, which is exactly what we need:

```java
@Autowired
private OpenApiWebMvcResource openApiResource;
@Value("classpath:snapshots/full-spec.json")
private Resource fullSnapshotSpec;
```

And then finally, we can write a test to retrieve the `OpenAPI` object from both the snapshot and the current specification and compare them with OpenAPI-Diff:

```java
@Test
void openApiSpec_matchesSnapshot() throws Exception {
    var parser = new OpenAPIV3Parser();
    var specBytes = openApiResource.openapiJson(new MockHttpServletRequest(), "/v3/api-docs", Locale.ENGLISH);
    var currentSpec = parser.readContents(new String(specBytes, StandardCharsets.UTF_8)).getOpenAPI();
    var snapshotSpec = parser.readContents(fullSnapshotSpec.getContentAsString(StandardCharsets.UTF_8)).getOpenAPI();
    var diff = OpenApiCompare.fromSpecifications(snapshotSpec, currentSpec);
    assertThat(diff.isUnchanged()).isTrue();
}
```

The `OpenApiCompare.fromSpecifications()` method returns a `ChangedOpenApi` object, this has two methods that are useful for testing.
These methods are `isUnchanged()` and `isCompatible()`.

The first one, which I used in the test above, verifies whether both Open API specifications are exactly the same.
While this would work, it also means it would also break if you add new endpoints.

So that's why I personally prefer the `isCompatible()` method:

```java
assertThat(diff.isCompatible()).isTrue();
```

![Same schematic as before, but this time the consumer is replaced with "???"](./images/api-contract-openapi-diff.png)

## Provider-driven testing with Spring Cloud Contract

While the previous example is easy to set up, it has a few drawbacks.
The biggest drawback is that this didn't allow us to test the logic of our consumers against mocks of the API.
While there's definitely tooling out there to generate stubs based on our OpenAPI specification, it would mean we need yet another tool.
Real contract testing libraries on the other hand provide this out of the box.

The first library I'm going to show is [Spring Cloud Contract](https://spring.io/projects/spring-cloud-contract).
Spring Cloud Contract offers both provider-driven contract testing and consumer-driven contract testing.
However, in reality the provider-driven contract testing is far easier to set up, so that's what we'll explore.

### Provider

To do this, Spring Cloud Contract offers a few things.
First of all, it has its own [contract DSL](https://docs.spring.io/spring-cloud-contract/reference/project-features-contract.html).
For example, in YAML it looks like:

```yaml
description: Returns all orders
request:
  method: GET
  urlPath: /orders
response:
  status: 200
  headers:
    Content-Type: application/json
  body:
    - id: 1
      customerId: customer-1
      total: 49.99
```

These YAML contracts have to be added to **src/test/resources/contracts/{name}**, for example, src/test/resources/contracts/orders.

In addition, it provides a library that allows you to write a test to verify that the API follows the contract:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-contract-verifier</artifactId>
    <scope>test</scope>
</dependency>
```

Luckily, you don't need to write the full test.
Since we already have our API contract, all you need to do is to set up the proper mocking so your controllers return a result that matches the API contract.
For example, in the above contract we expect a list of orders to be returned with some values.
So all we need to write now is something like this:

```java
@WebMvcTest(OrderController.class)
public abstract class ContractVerifierBase {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    OrderRepository repository;

    @BeforeEach
    void setUp() {
        RestAssuredMockMvc.mockMvc(mockMvc);
        var order = new Order(1L, "customer-1", new BigDecimal("49.99"));

        when(repository.findAll()).thenReturn(List.of(order));
        // TODO: Add other data mocking ...
    }
}
```

The final part for the provider is to add a Maven plugin.
This Maven plugin will both generate the test to verify that your API follows the contract **AND** it will generate [WireMock stubs](https://wiremock.org/) based on your API contract.
These API stubs can then be used by your consumers for their testing.

The plugin looks like this:

```xml
<plugin>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-contract-maven-plugin</artifactId>
    <version>5.0.3</version>
    <extensions>true</extensions>
    <configuration>
        <baseClassForTests>codes.dimitri.examples.contracttesting.ContractVerifierBase</baseClassForTests>
        <testFramework>JUNIT5</testFramework>
    </configuration>
</plugin>
```

If you now run `mvn generate-test-sources`, it will generate test classes that extend `ContractVerifierBase`.
These test classes can be found in **target/generated-test-sources/contract**.
The name of the test matches the name of the folder that contains your API contracts.
In my example that would be `OrdersTest`.

You can run this test manually in your IDE, or run it with `mvn test`.

If you run `mvn install`, two artifacts will be generated and installed to your local Maven repository:

1. The usual JAR-file that contains your application
2. A JAR-file that ends in `*-stubs.jar` that can be used by your consumers

### Consumers

Consumers can now use that stubs artifact to easily obtain mock endpoints for your API.
The easiest way to bootstrap those stubs is by including Spring Cloud Contract's stub runner:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-contract-stub-runner</artifactId>
    <scope>test</scope>
</dependency>
```

Adding this dependency will allow you to define a `StubRunnerExtension` JUnit extension in your tests:

```java
@RegisterExtension
static StubRunnerExtension stubRunner = new StubRunnerExtension()
    .stubsMode(StubRunnerProperties.StubsMode.LOCAL)
    .downloadStub("codes.dimitri.examples", "spring-contract-testing");
```

The stub runner can fetch stubs from either a classpath dependency, or by downloading it from either a local or remote Maven repository.
In this example, I installed the artifact locally with `mvn install`, so I went with `StubsMode.LOCAL`.
In addition, you can add `downloadStub()` for every stub you want to integrate with.

After that, you can use `stubRunner.findStubUrl()` to find the base url of the WireMock stubs, and configure whatever test you have.
For example, in my case I wrote a consumer that contains an `OrderClient`, which uses `RestClient` to retrieve the orders.
So to test that, I wrote:

```java
@Test
void findAll_returnsOrders() {
    var url = stubRunner.findStubUrl("codes.dimitri.examples", "spring-contract-testing").toURI();
    var client = new OrderClient(RestClient.builder().baseUrl(url).build());
    var orders = client.findAll();

    assertThat(orders).hasSize(1);
    assertThat(orders.getFirst().id()).isEqualTo(1L);
    assertThat(orders.getFirst().customerId()).isEqualTo("customer-1");
}
```

As you can see, I'm testing the same values as provided by the API contract.
Alternatively to the JUnit extension you can also use the following within a Spring test:

```java
@SpringBootTest
@AutoConfigureStubRunner(
    ids = "codes.dimitri.examples:spring-contract-testing:+:stubs:8123",
    stubsMode = StubRunnerProperties.StubsMode.LOCAL)
class OrderClientTest {
    // TODO: Implement
}
```

The format of the IDs is `groupid:artifactId:version:classifier:port`.
Using the `+` as a version means that you want to retrieve the latest version.
Within your test, you can use `http://localhost:8123` as the base URL to reach the stubs.

![Same schematic, but this time "Contract Verifier" is between "Provider" and "API contract". "YAML contract" is underneath "API contract", and "Stub runner" is between "API Contract" and "Consumer"](./images/api-contract-spring.png)

## Consumer-driven contract testing with Pact

The previous two options focused on the provider maintaining and publishing the API contracts.
This works great if you have little control over your consumers, for example with a public API.

And while both previous two options support consumer-driven contract testing, it does require some additional configuration.
Pact on the other hand focuses primarily on consumer-driven contract testing.

### Consumer

The first thing we need to do is to define our API contracts.
Since we're using consumer-driven contract testing, these contracts will live in our **consumer** project.
Pact calls these API contracts "pacts". 
Pacts are formatted as JSON files.
However, we don't write these JSON files ourselves.

Instead of that, we write a unit test that uses the Pact Java DSL to describe the pact.
At the same time, that description can be used to generate stubs for our client test, similar to `OrderClientTest` before.

To do this, we first need to import a library:

```xml
<dependency>
    <groupId>au.com.dius.pact.consumer</groupId>
    <artifactId>junit5</artifactId>
    <version>4.7.0</version>
    <scope>test</scope>
</dependency>
```

After that, we can set up our Pact consumer test:

```java
@PactConsumerTest
class PactOrderClientTest {
    // TODO: Implement
}
```

To describe the pact itself, we write a method that uses the `@Pact` annotation:

```java
@Pact(consumer = "spring-contract-testing-consumer", provider = "spring-contract-testing")
V4Pact findAll(PactBuilder builder) {
    // TODO: Implement    
}
```

Within this method, we use the `PactBuilder` to describe our API:

```java
return builder
    .expectsToReceiveHttpInteraction("a request for all orders", interaction -> interaction
        .state("orders exist")
        .withRequest(request -> request
            .method("GET")
            .path("/orders")
        )
        .willRespondWith(response -> response
            .status(200)
            .header("Content-Type", Matchers.regexp("application/json.*", "application/json"))
            .body(LambdaDsl.newJsonArrayMinLike(1, array ->
                array.object(o -> {
                    o.integerType("id", 1);
                    o.stringType("customerId", "customer-1");
                    o.decimalType("total", new BigDecimal("49.99"));
                })
            ).build())
        )
    )
    .toPact();
```

Similar to our previously defined contracts, we define that the response should be a JSON array containing an id, customerId and total field.

After that, we can write a test for our `OrderClient` and reference the contract to set up some stubs:

```java
@Test
@PactTestFor(pactMethod = "findAll")
void findAll_returnsOrders(MockServer mockServer) {
    var restClient = RestClient.builder().baseUrl(mockServer.getUrl()).build();
    var client = new OrderClient(restClient);
    var orders = client.findAll();
    assertThat(orders).hasSize(1);
    assertThat(orders.getFirst().id()).isEqualTo(1L);
    assertThat(orders.getFirst().customerId()).isEqualTo("customer-1");
}
```

As you can see, this looks very similar to our Spring Cloud Contract consumer test.
The main difference is that we can now reference the Pact contract by using the `@PactTestFor` annotation and reference the method that contains the `V4Pact`.
Pact will then inject `MockServer` directly into the test.

If you run the tests, you'll see a **target/pacts** folder being generated.
Inside, you can find your pact JSON files.

### Broker

The difficult question now is, how do we get that contract into our provider without directly depending on our consumers?
Many consumer-driven contract testing frameworks provide some kind of central hub for this.
Pact is no different and provides a **Pact broker**. This Pact broker can be run locally, or you can use their cloud offering called **Pactflow**.

In this example, I'll run it locally through Docker:

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: pact
      POSTGRES_PASSWORD: pact
      POSTGRES_DB: pact
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pact"]
      interval: 5s
      timeout: 5s
      retries: 5

  pact-broker:
    image: pactfoundation/pact-broker:latest
    ports:
      - "9292:9292"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      PACT_BROKER_DATABASE_URL: postgres://pact:pact@postgres/pact
```

This sets up two images, a Postgres database to store the data inside, and the Pact broker itself.
Once it runs, you can view the dashboard at `http://localhost:9292`.

![An empty Pact dashboard](./images/empty-pact-dashboard.png)

To publish our API contracts to the Pact broker, we need to add a Maven plugin to our consumers:

```xml
<plugin>
    <groupId>au.com.dius.pact.provider</groupId>
    <artifactId>maven</artifactId>
    <version>4.7.0</version>
    <configuration>
        <pactBrokerUrl>http://localhost:9292</pactBrokerUrl>
    </configuration>
</plugin>
```

After that, we can run `mvn pact:publish` to get our contract onto our broker.

If we now look back at our Pact broker, we see our first contract:

![The pact is shown on the Pact broker dashboard](./images/pact-dashboard-with-pact.png)

You'll also see that the "Last verified" column is empty.
This is because we haven't verified the contract within our provider yet.

### Provider

At the provider-side, we now need to test whether our API matches the contract.
To do this, we'll add the following library:

```xml
<dependency>
    <groupId>au.com.dius.pact.provider</groupId>
    <artifactId>spring7</artifactId>
    <version>4.7.0</version>
    <scope>test</scope>
</dependency>
```

The next part is to configure the test class itself:

```java
@Provider("spring-contract-testing")
@PactBroker(url = "${pact.broker.url:http://localhost:9292}")
@WebMvcTest(OrderController.class)
class PactOrderVerificationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderRepository repository;

    @BeforeEach
    void setUp(PactVerificationContext context) {
        context.setTarget(new Spring7MockMvcTestTarget(mockMvc));
    }

    @TestTemplate
    @ExtendWith(PactVerificationSpring7Provider.class)
    void verifyPact(PactVerificationContext context) {
        context.verifyInteraction();
    }

    // TODO: Implement
}
```

This does a few things.
First of all, we turn this test into a Spring Web MVC test using MockMVC so that we can properly test our controllers.
We also tell Pact where our broker (and thus our contract) is located, and which provider this is.

![Schematic of "Pact Spring library" between "Provider" and "Contract" and "Pact test library" between "Consumer" and "Contract"](./images/api-contract-pact.png)

We also integrate Pact with MockMVC so that Pact can call the right endpoints.
This is done by setting up `Spring7MockMvcTestTarget` and using `verifyInteraction()` for every test.

All what remains now is to provide the required mocking, similar to our `ContractVerifierBase` in Spring Cloud Contract.

For example, a possible test could be:

```java
@State("orders exist")
void ordersExist() {
    var order = new Order(1L, "customer-1", new BigDecimal("49.99"));
    when(repository.findAll()).thenReturn(List.of(order));
}
```

What will happen here is that Pact will run the right test for every pact it finds.
Before it runs the verification, it will run the proper method that sets up the mocks.
This method is derived from the pact state (`@State("orders exist")`), which matches the state that our consumers provided:

``` java
// We wrote this in our consumer earlier:
@Pact(consumer = "spring-contract-testing-consumer", provider = "spring-contract-testing")
V4Pact findAll(PactBuilder builder) {
    return builder
        .expectsToReceiveHttpInteraction("a request for all orders", interaction -> interaction
        .state("orders exist") // <--- This should match
        // ...
        .build();
}
```

After the mocks are executed in `ordersExist()`, Pact can then control MockMVC to check whether `/orders` returns a result that matches the API contract provided by the consumer.

If you also want to publish these verification results back to the Pact broker, you also need to configure the Maven Surefire plugin:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <systemPropertyVariables>
            <pact.verifier.publishResults>true</pact.verifier.publishResults>
            <pact.provider.version>${project.version}</pact.provider.version>
        </systemPropertyVariables>
    </configuration>
</plugin>
```

If you now run the test through Maven (`mvn test`), the results will be published onto the Pact broker:

![Pact dashboard with verification](./images/pact-dashboard-verification.png)

In addition, you can also check the matrix to see which version matches:

![Pact dashboard with matrix showing 0.0.1-SNAPSHOT of the consumer is supported by 0.0.1-SNAPSHOT of the provider](./images/pact-dashboard-matrix.png)

## Conclusion

Contract testing is one of those things that seems overkill until the moment it isn't.
OpenAPI-Diff is the easiest option to get started with, but it only tells you whether the provider changed.
It says nothing about whether your consumers actually care, and it doesn't generae any stubs for them to test against.

Spring Cloud Contract and Pact go further by tying the provider and consumer together through a shared contract and generating stubs in the process.

Here's a quick overview of how the three options compare:

|                          | OpenAPI-Diff   | Spring Cloud Contract   | Pact                       |
|--------------------------|----------------|-------------------------|----------------------------|
| Provider-driven          | ✓              | ✓                       | Possible but not the focus |
| Consumer-driven          | ✗              | Possible but more setup | ✓                          |
| Generates consumer stubs | ✗              | ✓                       | ✓                          |
| Public API               | ✓              | ✓                       | ✗                          |
| Multi-language consumers | ✓ (spec-based) | Possible but more setup | ✓                          |

Personally, I'd reach for Pact when I have control over my consumers and want the clearest feedback loop, and fall back to OpenAPI-Diff for public APIs where consumer-driven testing isn't an option.

