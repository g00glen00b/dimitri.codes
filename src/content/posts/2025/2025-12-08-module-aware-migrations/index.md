---
title: "Module-aware database migrations with Modulith"
featuredImage: "/logos/modulith.jpeg"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Modulith", "Advent of Spring"]
excerpt: "Together with Spring framework v7 and Spring Boot v4, Spring Modulith v2 was also released. One of its new killer-features is its module-aware database migrations when using Flyway."
---

## Introduction

Spring Boot 4 has been released last month!
Considering all the new features it has, I decided to write about these features throughout the month of December.
It will be an advent of Spring Boot 4 related tips!

Around the same time that Spring framework 7 and Spring Boot 4 were released, Spring Modulith also got its new v2 release.
One of the new features of Spring Modulith v2 is that it now supports module-aware database migrations with Flyway.

## Database migrations

In case you didn't know, Spring Boot allows you to version your database schema with either **Flyway** or **Liquibase**.
I personally like Flyway a lot for its simplicity, and it's also the only one that Spring Modulith now supports for its module-aware database migrations.

The way Flyway in general works is that you can store versioned SQL files in your `src/main/resources/db/migration` folder.
Flyway will look at those files during startup, and execute whichever SQL file wasn't executed before.

So for example, you could start with a file called **V1.0__setup.sql** and when you run your application, Flyway will execute it.
The next time you want to make a change, you create a new file such as **V1.1__important_changes.sql**.
The next time your application starts up, Flyway will only execute this new SQL file as it keeps track of what SQL files it has already executed.
It does this by setting up its own database table and keeping track of the filenames and a file hash.
This is an important thing to realize, because Flyway won't allow you to edit your database migration files.
If you did edit it, Flyway will throw an exception because it sees that the file hashes do not match.

So in general, you always want to create new database migration files!

## Module-aware database migrations

Spring Modulith now extends this behavior by also making it possible to provide module-aware database migrations.
The way this works is that you no longer store your database migration files directly within `src/main/resources/db/migration`, but inside a module-specific folder **src/main/resources/db/migration/{module}**.
Each module can have its own versions, so now you can have a **V1.0__{name}.sql** file for each module.

For example, I'm currently developing a medication tracker application, which has the following modules:

1. Medication
2. Intake log
3. Notification
4. Profile
5. Common

In stead of having one folder with all database migrations, I use the following structure:

```none
src/main/resources/
└─ db/migration/
   ├─ common/
   │  ├─ V1.0__Spring_Batch.sql
   │  └─ V1.1__Spring_Modulith_Events.sql
   ├─ intakelog/
   │  └─ V1.0__Intakelog.sql
   ├─ medication/
   │  ├─ V1.0__Medication.sql
   │  ├─ V1.1__Medication_Types.sql
   │  ├─ V1.2__Medication_Schedule.sql
   │  └─ V1.3__Medication_Packs.sql
   ├─ notification/
   │  ├─ V1.0__Notification.sql
   │  └─ V1.1__Subscription.sql
   └─ profile/
      └─ V1.0__Profile.sql
```

In addition to separating your database migration files per module, you also need to enable this feature by configuring the following property:

```properties
# application.properties
spring.modulith.runtime.flyway-enabled=true
```

The nice thing is that this doesn't only work while running the application, but the various database migration modules are also taken into account when running tests.
For example, imagine I have a `MedicationApiIntegrationTest`. In this test suite I want to test some components within the medication module, but this module also depends on the common module.
So in this case, I would annotate my test like this:

```java
@ApplicationModuleTest(extraIncludes = "common")
class MedicationApiIntegrationTest {
    // ...
}
```

The nice part is that now Spring Modulith/Flyway will only run the migrations defined within the common- and medication-module.

### Conclusion

Spring Modulith has been a very useful building block towards cleaner Spring applications from the start.
The new v2 release goes a step further in that direction thanks to its module-aware database migrations.

This blogpost is a part of the [Advent of Spring Boot 2025 series](/advent-of-spring).
