---
title: "Fixing Spring Boot's MongoDB healthcheck for Cosmos DB"
featuredImage: "/logos/cosmosdb.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Azure", "MongoDB"]
excerpt: "In this tutorial, we will fix Spring Boot's health actuator for MongoDB if you're using CosmosDB."
---

## Background

If you're using [Azure Cosmos DB for MongoDB](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/introduction) and you've upgraded to Spring Boot 3.2.7 or higher recently, you might have noticed it: the Spring Boot health actuator no longer works.
The error you'll see is something like this:

```json
{
  "status": "DOWN",
  "details": {
    "error": "org.springframework.dao.InvalidDataAccessApiUsageException: Command failed with error 115 (CommandNotSupported): 'Command hello not supported.' on server my-cosmosdb.mongo.cosmos.azure.com:10255. The full response is {\"ok\": 0.0, \"errmsg\": \"Command hello not supported.\", \"code\": 115, \"codeName\": \"CommandNotSupported\"}"
  }
}
```

In addition, you'll see a a stacktrace containing a message lik this:

```
Caused by: com.mongodb.MongoCommandException: Command failed with error 115 (CommandNotSupported): 'Command hello not supported.' on server my-cosmosdb.mongo.cosmos.azure.com:10255. The full response is {"ok": 0.0, "errmsg": "Command hello not supported.", "code": 115, "codeName": "CommandNotSupported"}
```

The reason you're suddenly see this exception is because in Spring Boot 3.2.7, the command to check the MongoDB health has been changed.
Previously, it used the `db.runCommand({isMaster: 1})` command ([documentation](https://www.mongodb.com/docs/v4.4/reference/command/isMaster/)).

However, this check was proven to be flaky, because the `isMaster` command is not a part of the stable API and was deprecated in MongoDB 4.4.2 ([documentation](https://www.mongodb.com/docs/v5.0/reference/stable-api-changelog/)).
This means that if strict mode was configured, the previous actuator would fail.

So, since Spring Boot 3.2.7, the previous check was replaced by `db.runCommand({hello: 1})`, which was introduced in MongoDB 4.4.2 and later backported to older MongoDB versions as well ([see issue](https://github.com/spring-projects/spring-boot/issues/41101)).

Normally, this shouldn't be a problem, since Cosmos DB also included support for the `hello` command in the MongoDB support for 4.0 and later ([documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/feature-support-40#diagnostics-commands)).
The problem however is that this support is only partially implemented. The following command will work on both MongoDB as on Cosmos DB:

```javascript
db.hello(); // Works on both MongoDB and Cosmos DB
```

The next command will however only work on MongoDB:

```javascript
db.runCommand({hello: 1}); // Works on MongoDB, but fails on Cosmos DB
```

Summarized, this means that **MongoDB for Cosmos DB is not compliant with the official MongoDB specification**.

![Spring Boot + MongoDB + Cosmos DB](./images/spring-boot-mongodb-cosmosdb.png)

### The solution

The solution is that if you're using Spring Boot 3.2.7 or higher, you cannot rely on the builtin health indicator.
This means that you at least need to disable it by configuring the following property:

```properties
management.health.mongo.enabled=false
```

In addition, you can implement your own custom health indicator.
However, since executing shell commands through the Java driver isn't very easy and `isMaster` is deprecated, we should look for an alternative database command to validate your MongoDB connection.
The command I chose is `buildInfo`, which is both supported by MongoDB ([documentation](https://www.mongodb.com/docs/manual/reference/command/buildInfo/)) as by Cosmos DB ([documentation](https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/feature-support-40#diagnostics-commands)).

To implement this health indicator, you can write something like this:

```java
@Component
public class MongoHealthIndicator extends AbstractHealthIndicator {
	private final MongoTemplate mongoTemplate;

	public MongoHealthIndicator(MongoTemplate mongoTemplate) {
		super("MongoDB health check failed");
		Assert.notNull(mongoTemplate, "'mongoTemplate' must not be null");
		this.mongoTemplate = mongoTemplate;
	}

	@Override
	protected void doHealthCheck(Health.Builder builder) throws Exception {
		Document result = this.mongoTemplate.executeCommand("{ buildInfo: 1 }");
		builder.up();
	}

}
```

Alternatively, if you use the reactive version of Spring Data MongoDB, you need to use the `ReactiveMongoTemplate` and the `AbstractReactiveHealthIndicator` class and then you can write a health indicator like this:

```java
@Component
public class MongoReactiveHealthIndicator extends AbstractHealthIndicator {
	private final ReactiveMongoTemplate reactiveMongoTemplate;

	public MongoReactiveHealthIndicator(ReactiveMongoTemplate reactiveMongoTemplate) {
		super("MongoDB health check failed");
		Assert.notNull(reactiveMongoTemplate, "'reactiveMongoTemplate' must not be null");
		this.reactiveMongoTemplate = reactiveMongoTemplate;
	}

	@Override
	protected Mono<Health> doHealthCheck(Health.Builder builder) throws Exception {
        return mongoTemplate
            .executeCommand("{ buildInfo: 1 }")
            .map(document -> builder.up().build());
	}

}
```

Note, these indicators are based on the existing [`MongoHealthIndicator`](https://github.com/spring-projects/spring-boot/blob/ea89e181cb52606b4f266605a4d77e250220d5ef/spring-boot-project/spring-boot-actuator/src/main/java/org/springframework/boot/actuate/data/mongo/MongoHealthIndicator.java) and [`MongoReactiveHealthIndicator`](https://github.com/spring-projects/spring-boot/blob/ea89e181cb52606b4f266605a4d77e250220d5ef/spring-boot-project/spring-boot-actuator/src/main/java/org/springframework/boot/actuate/data/mongo/MongoReactiveHealthIndicator.java).

After that, if you launch your application, you should see the new health indicator working properly.