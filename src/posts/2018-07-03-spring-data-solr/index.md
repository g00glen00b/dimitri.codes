---
title: "Working with Spring Data Solr repositories"
date: "2018-07-03"
categories: ["Java", "Tutorials"]
tags: ["Solr", "Sprinng boot", "Spring data"]
---

Spring Data is the go-to framework when trying to get access to a database within a Spring application. Next to relational databases it also provides support for a wide variety of noSQL databases, including document-based databases like Apache Solr. In this tutorial I'll explore the various possibilities of using Spring Data Solr.

### Getting started

To create a new Spring boot project with Spring Data Solr, you need to add the **spring-boot-starter-data-solr** dependency, for example:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-solr</artifactId>
</dependency>
```

If you're using [Spring Initializr](http://start.spring.io/), this is equivalent to adding the **Solr** dependency. Additionally that, you probably also have to configure the `spring.data.solr.host` repository, for example:

```
spring.data.solr.host=http://localhost:8983/solr
```

![Spring boot + Spring Data + Apache Solr](images/spring-boot-data-solr.png)

### Writing custom queries

To write custom queries, you first have to make sure that you have your model setup. In my case, I'm going to look for indexed files, containing a `file.id` identifier and a `last_modified` and `content` field. This is based on [my earlier tutorials](/indexing-documents-spring-batch/) about indexing documents using Spring batch:

```java
@Data
@SolrDocument(solrCoreName = MarkdownDocument.MARKDOWN_CORE)
public class MarkdownDocument {
    public static final String MARKDOWN_CORE = "markdown";
    public static final String FILE_ID_FIELD = "file.id";
    public static final String CONTENT_FIELD = "content";
    public static final String LAST_MODIFIED_FIELD = "last_modified";
    @Id
    @Indexed(FILE_ID_FIELD)
    private String id;
    @Indexed(CONTENT_FIELD)
    private String content;
    @Indexed(LAST_MODIFIED_FIELD)
    private LocalDateTime lastModified;
}
```

What's interesting here is that you can use a multi-core setup by defining the `solrCoreName` when adding the `@SolrDocument` annotation.

Now that we have our model, we can start writing a repository:

```java
public interface MarkdownDocumentRepository extends SolrCrudRepository<MarkdownDocument, String> {
    // TODO Add custom queries
}
```

Now we can start adding methods using the `@Query` annotation to provide a Solr query:

```java
public interface MarkdownDocumentRepository extends SolrCrudRepository<MarkdownDocument, String> {
    @Query("file.id:?0 OR content:?0")
    List<MarkdownDocument> findAll(String searchTerm);
}
```

In this example, we'll look for all documents matching a given term that could be either within the `file.id` field or the `content` field.

Alternatively, we can write queries using [method naming](https://docs.spring.io/spring-data/solr/docs/current/reference/html/#solr.query-methods.criterions):

```java
public interface MarkdownDocumentRepository extends SolrCrudRepository<MarkdownDocument, String> {
    List<MarkdownDocument> findByContent(String searchTerm);
}
```

Similar to before, we're now looking for all documents where the content contains the given search term.

### Boosting documents

By default, Solr will already boost certain documents. Let's say we have the following query:

```java
List<MarkdownDocument> findByIdOrContent(String id, String content);
```

In this case, documents that match both the given `id` and the `content` field, will score higher than documents matching either field. This can be easily seen if you add the score field to your model by adding a new field and annotating it with `@Score`:

```java
@Score
private float score;
```

If you run your application now, you'll see that documents matching both `id` and `content` will score double the amount of the other documents. The amount of occurences also changes the score.

However, we can also boost certain documents by providing a higher score for certain matches, for example:

```java
List<MarkdownDocument> findByIdOrContent(@Boost(2) String id, String content);
```

In this case, documents that match the given `id`, will score higher than documents that just match the given `content`. This allows us to get our results in a different order (default sort order of the results is by score), and thus mark more important results.

### Pagination

Working with pagination works the same across all implementations of Spring Data. You simply add a `Pageable` to your repository method and return a `Page<MarkdownDocument>` rather than a `List<MarkdownDocument>`:

```java
Page<MarkdownDocument> findByIdOrContent(@Boost(2) String id, String content, Pageable pageable);
```

Now you can start paginating by calling this method using the `PageRequest` class, or by implementing your own `Pageable` class, for example:

```java
public class OffsetPageRequest implements Pageable {
    private long offset;
    private int limit;
    private Sort sort;

    public OffsetPageRequest(long offset, int limit) {
        this(offset, limit, null);
    }

    public OffsetPageRequest(long offset, int limit, Sort sort) {
        this.offset = offset;
        this.limit = limit;
        this.sort = sort;
    }

    @Override
    public int getPageNumber() {
        return 0;
    }

    @Override
    public int getPageSize() {
        return limit;
    }

    @Override
    public long getOffset() {
        return offset;
    }

    @Override
    public Sort getSort() {
        return sort;
    }

    @Override
    public Pageable next() {
        return new OffsetPageRequest(getOffset() + getPageSize(), getPageSize(), getSort());
    }

    @Override
    public Pageable previousOrFirst() {
        return new OffsetPageRequest(Math.max(0, getOffset() - getPageSize()), getPageSize(), getSort());
    }

    @Override
    public Pageable first() {
        return new OffsetPageRequest(0, getPageSize(), getSort());
    }

    @Override
    public boolean hasPrevious() {
        return getOffset() > 0;
    }
}
```

This implementation allows you to work with offsets and limits rather than pages and pagesizes.

### Highlighting results

If you look at search engines like Google, you'll notice that they also highlight their results. This is something Solr can do as well, and Spring Data offers you a simple annotation called `@Highlight` to make it work:

```java
@Highlight(prefix = "<strong>", postfix = "</strong>", fields = {MarkdownDocument.FILE_ID_FIELD, MarkdownDocument.CONTENT_FIELD})
HighlightPage<MarkdownDocument> findByIdOrContent(@Boost(2) String id, String content, Pageable pageable);
```

Make sure to also use `HighlightPage`, otherwise the highlighting data won't be available (`getHighlighted()`).

### Fuzzy search

Solr also allows you to work with edit distances, so that means that if you search for "goat", you'll also get results for "boat" if you enable an edit distance of 1. This type of search operation is also called fuzzy search. To implement this, you need to append the tilde (`~`) to your search operation, followed by the edit distance. For performance reasons you shouldn't use an edit distance larger than two.

```java
repository.findByIdOrContent("title", "goat~1");
```

### Working with criteria

When working with repositories, you sometimes want to have more control about the queries you're about to execute by programmatically defining them. To do this, we can use the criteria API. Before we can start, we'll have to define a `SolrTemplate` bean though:

```java
@Bean
public SolrTemplate solrTemplate(SolrClient solrClient) {
    return new SolrTemplate(solrClient);
}
```

After defining this bean, we can extend our existing repository by creating a new interface, for example:

```java
public interface CustomMarkdownDocumentRepository {
    HighlightPage<MarkdownDocument> findDocuments(String searchTerm, Pageable page);
}
```

We can now add this extension to our repository:

```java
public interface MarkdownDocumentRepository extends SolrCrudRepository<MarkdownDocument, String>, CustomMarkdownDocumentRepository {
}
```

And after that, we can create our own implementation:

```java
@AllArgsConstructor
public class MarkdownDocumentRepositoryImpl implements CustomMarkdownDocumentRepository {
    private SolrTemplate solrTemplate;

    @Override
    public HighlightPage findDocuments(String searchTerm, Pageable page) {
        Criteria fileIdCriteria = new Criteria(MarkdownDocument.FILE_ID_FIELD).boost(2).is(searchTerm);
        Criteria contentCriteria = new Criteria(MarkdownDocument.CONTENT_FIELD).fuzzy(searchTerm);
        SimpleHighlightQuery query = new SimpleHighlightQuery(fileIdCriteria.or(contentCriteria), page);
        query.setHighlightOptions(new HighlightOptions()
            .setSimplePrefix("<strong>")
            .setSimplePostfix("</strong>")
            .addField(MarkdownDocument.FILE_ID_FIELD, MarkdownDocument.CONTENT_FIELD));
        return solrTemplate.queryForHighlightPage(MarkdownDocument.MARKDOWN_CORE, query, MarkdownDocument.class);
    }
}
```

In this example, we build two criteria's:

1. A criteria that checks if the `file.id` field matches the given search term, and if it does, boost the score by a factor of two.
2. Another criteria that checks if the content field fuzzy matches the given search term.

After creating those criteria's, you can either use the `Criteria.and()` or the `Criteria.or()` method to join them, and to create a query of them. There are various query implementations such as `SimpleQuery`, `SimpleHighlightQuery`, ... . Depending on the type of result or page you want to retrieve, you'll have to pick a different query implementation.

In this case, I'm using the `SimpleHighlightQuery` and I'm providing the pre- and postfix as seen before by passing a `HighlightOptions` object. Accessing the highlighted parts can be done by using the `page.getHighlights(solrDocument)` method.

### Resources

The full code example using the criteria's can be found on [GitHub](https://github.com/g00glen00b/spring-samples/tree/master/spring-boot-solr-batch).
