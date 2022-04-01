---
title: "Running a Spring batch at a schedule"
featuredImage: "../../../images/logos/spring-batch.png"
categories: ["Java", "Tutorials"]
tags: ["Spring batch", "Spring boot"]
excerpt: "Writing a RESTful webservice with Spring is easy, even easier with Spring Boot. But did you also know that validation is quite easy as well with Spring?"
---

[Last time](/indexing-documents-spring-batch/), I wrote a Spring batch application to index local markdown files into Apache Solr. While the default configuration of Spring batch is great, I don't want to re-run the application to re-index all documents. In this tutorial I'll show you how you can run a batch job at a certain schedule.

### Disabling default behaviour

The default behaviour, as explained, is that every Spring batch job will run at the start of the application. To disable this, you need to configure the `spring.batch.job.enabled` property in your application configuration, for example:

```yaml
spring:
  batch:
    job:
      enabled: false
```

### Adding the `@EnableScheduling` annotation

To allow using scheduled tasks, you also have to add the `@EnableScheduling` annotation to either a configuration class (a class annotated with `@Configuration`) or to the main class, for example:

```java
@SpringBootApplication
@EnableScheduling
public class SpringBootSolrBatchApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootSolrBatchApplication.class, args);
    }
}
```

### Creating a scheduled task

Now that we have disabled Spring batch from running at the start of the application, it's time to re-enable it in a different way, by scheduling it.

To do this, you have to create a new component, so that we can autowire:

- A Spring batch `Job`, like the one I made in my previous tutorial to index my Markdown files.
- The `JobLauncher`, which is created by Spring boot if you're using the Spring batch starter and if you've defined a job.

```java
@Component
@AllArgsConstructor
public class MarkdownSolrBatchScheduler {
    private JobLauncher jobLauncher;
    private Job indexMarkdownDocumentsJob;

}
```

After that, we can use Spring's `@Scheduled` annotation to invoke a method at certain times. For example:

```java
@Scheduled(cron = "0 * * * * *")
public void schedule() {

}
```

In this example, I'm using a cron job to run the `schedule()` method every minute at zero seconds specifically. This means that the job will run at 05:00:00, 05:01:00, 05:02:00 and so on.

Alternatively, you can use the `fixedRate` property of `@Scheduled` to run the job every x milliseconds, for example:

```java
@Scheduled(fixedRate = 60000)
public void schedule() {

}
```

In this example, the method will run every minute since the start of the application. If you don't want to run your job every x milliseconds, but you want to run the method x milliseconds after it has been run, you can use the `fixedDelay` property:

```java
@Scheduled(fixedDelay = 60000)
public void schedule() {

}
```

In this example, the method will run a minute after it stopped last time. So basically this allows you to run the batch job again, a minute after it has been stopped.

### Using the `JobLauncher`

Launching a job isn't that difficult with the `JobLauncher`. All you need to do is to call the `run()` method and passing the job and the parameters it needs, for example:

```java
jobLauncher.run(indexMarkdownDocumentsJob, new JobParametersBuilder().toJobParameters());
```

If we don't want to send any parameters, we can't just leave `null` but we have to use the `JobParametersBuilder` to pass a valid object.

However, Spring batch won't run the same job with the same parameters twice. This will be a problem if we want to run the same job at different times. A possible solution is to pass the date of when the scheduler started as a parameter:

```java
@Scheduled(cron = "0 * * * * *")
public void schedule() throws JobParametersInvalidException, JobExecutionAlreadyRunningException, JobRestartException, JobInstanceAlreadyCompleteException {
    jobLauncher.run(indexMarkdownDocumentsJob, new JobParametersBuilder()
        .addDate("date", new Date())
        .toJobParameters());
}
```

By doing this, the parameters will always be different, which means the scheduler will always properly run the Spring batch job.

### Externalizing your cron expression

One thing you might want to do, is to externalize the cron expression, in our case `0 * * * * *`. To do this, you can create a separate property within your `application.yml` or `application.properties` file, for example:

```yaml
batch:
  cron: 0 * * * * *
```

Now you can reference it like this:

```java
@Scheduled(cron = "${batch.cron}")
public void schedule() {
    // ...
}
```

Sadly, at this moment support is limited to properties, so you can't use the Spring expression language or SpEL to its fullest extend.

Both the `fixedDelay` and `fixedRate` properties have string-based variants as well, such as `fixedDelayString` and `fixedRateString`. These allow you to use external configuration for those properties as well:

```java
@Scheduled(fixedDelayString = "${batch.delay}")
public void schedule() {
    // ...
}

@Scheduled(fixedRateString = "${batch.rate}")
public void schedule2() {
    // ...
}
```
