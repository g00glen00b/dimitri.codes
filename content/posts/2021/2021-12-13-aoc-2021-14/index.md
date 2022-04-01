---
title: "Advent of code 2021 - Day 14"
featuredImage: "../../../images/logos/java.png"
categories: ["Java", "Tutorials"]
tags: ["Java"]
excerpt: ""
---

### Introduction
Yup, it's that time of the year again, the festive season! Christmas trees, lights, decoration, ... and the [Advent of Code](https://adventofcode.com/2021)!
If you're not familiar with the Advent of Code, well, it's a puzzle game for programmers during the advent.

Each day, you get a new challenge, written as part of a bigger story.
The goal of these challenges it to find the result by using your programming skills.

### The challenge

Today's challenge was one of those good old, "how efficient is your code" challenges.
The challenge input consists out of two parts. First, we have a list of elements (eg. "ABCD").
The second part is a list of insertion rules. For example, one of the insertion rules could be "AB -> C".
In that case, we have to insert a C between each occurrence of "AB". In our example, that would become "ACBCD".

### Part one

#### Plain old (immutable) Java Objects

Now that we explained the rules, it's time for the first part of the challenge. For each combination of elements, there will be an insertion rule.
That means that if we apply all the rules, the length of the list of elements nearly doubles.

Part one of the question is to repeat this process ten times, and to find out which element occurs most and least often.

The first class I wrote is a class to represent each pair of elements as a separate object. This means that "ABCD" would become AB, BC and CD.

To do this, I created the following clas:

```java
@Value
public class PolymerPair {
    Character leftElement;
    Character rightElement;
}
```

Then, I would do the same with the insertion rules. An insertion rule is basically a way to replace one pair of elements by two other pairs.
For example, if we take the insertion rule I mentioned before (AB -> C), then that would become (AB -> (AC,CB)).

To store this information, I created the following class:

```java
@Value
public class PolymerPairInsertionRules {
    Map<PolymerPair, List<PolymerPair>> rules;

    public List<PolymerPair> calculateNewPairs(PolymerPair pair) {
        return rules.getOrDefault(pair, List.of(pair));
    }

    public static PolymerPairInsertionRules fromLines(List<String> lines) {
        Map<PolymerPair, List<PolymerPair>> rules = lines
            .stream()
            .collect(toMap(
                line -> new PolymerPair(line.charAt(0), line.charAt(1)),
                line -> List.of(
                    new PolymerPair(line.charAt(0), line.charAt(6)),
                    new PolymerPair(line.charAt(6), line.charAt(1))
                )
            ));
        return new PolymerPairInsertionRules(rules);
    }
}
```

This class represents the whole set of rules, translated to a key/value store (a `Map`).

I also wrote a method to create this object from the input. Since the input is `AB -> C`, I created the following pairs:

1. A pair with the elements at position zero and one (A, B).
2. A pair with the elements at position zero and six (A, C).
3. And a pair with the elements at position six and one (C, B).

In addition to the `fromLines()` method I also created a `calculateNewPairs()` method which translates the pair into the new result.
If the pair could not be found within the list, the original pair is returned (that's what the `getOrDefault()` method does).

#### The naive solution

The next part is to implement the polymer structure (the list of element pairs) itself.
Naive me started by storing each individual pair within a list (`List<PolymerPair>`).

However, as I mentioned before, after each iteration, the result will nearly double in size.
Since the COVID-19 pandemic, we all know what this means... there's some exponential growth here!

#### The better solution

Luckily, the amount of possible element pairs is limited. So, in stead of storing each individual pair, I decided to keep track of how many times a specific pair appears in the list.
In our original example that would be:

- A,B = 1
- B,C = 1
- C,D = 1

However, if we need to keep track how often each element appears, we have a problem.
We could count how often each element appears by counting how often each left element appears in a pair.
In that case, we would only count A, B and C, and we would be missing the last element D.

To solve this, we could create an additional pair called (D, nothing). In that case, we have the following counts:

- A,B = 1
- B,C = 1
- C,D = 1
- D,null = 1

To implement this, I created a new class called `PolymerPairCount`:

```java
@With
@Value
public class PolymerPairCount {
    PolymerPair pair;
    long count;
}
```

In addition to the `@Value` annotation, I'm also using the `@With` annotation.
This Lombok annotation provides a method for each field to create a new instance, changing only the given field.

This makes it easier to apply the insertion rules, because now we could do something like this:

```java
PolymerPair ab = new PolymerPair('A', 'B');
PolymerPair ac = new PolymerPair('A', 'C');
PolymerPair cb = new PolymerPair('C', 'B');
PolymerPairCount abCount = new PolymerPairCount(ab, 10);
PolymerPairCount acCount = abCount.withPair(ac);
PolymerPairCount cbCount = abCount.withPair(cb);
```

In this example, `ab` would be our original pair, while `ac` and `cb` would be the replacement pairs.
By using `withPair()` we can replace the entire count of AB to the same count, but for AC and CB.

#### Implementing the better solution

So, to implement this, I created a new class called `PolymerTemplate` that has a list of `PolymerPairCount` objects:

```java
@Value
public class PolymerTemplate {
    List<PolymerPairCount> pairCounts;

    // TODO: Implement
}
```

Since Java makes it easier to group by and count/sum to a `Map`, I also created a constructor that translates a `Map<PolymerPair, Long>` to a list of `PolymerPairCount`:

```java
@Value
public class PolymerTemplate {
    List<PolymerPairCount> pairCounts;

    public PolymerTemplate(Map<PolymerPair, Long> counts) {
        this.pairCounts = counts
            .entrySet()
            .stream()
            .map(entry -> new PolymerPairCount(entry.getKey(), entry.getValue()))
            .collect(toList());
    }
}
```

The next step was to create a static method `fromLine` that translates the original string (ABCD) to a list of pair counts:

```java
public static PolymerTemplate fromLine(String line) {
    Map<PolymerPair, Long> counts = IntStream
        .range(0, line.length())
        .mapToObj(index -> new PolymerPair(
            line.charAt(index),
            index == line.length() - 1 ? null : line.charAt(index + 1)))
        .collect(groupingBy(identity(), counting()));
    return new PolymerTemplate(counts);
}
```

This is the first example where the new constructor comes in handy.
In this example we're create a `PolymerPair` for each pair and count how often each pair occurs.
This is done by pairing the `groupingBy()` collector with the `counting()` collector, as seen in the code above.

To make sure that we also create a pair for the final element (as mentioned before), I'm checking whether the current character is the last one, and if so, I set the `rightElement` of the `PolymerPair` to `null`.

The next part is to create a method that accepts a `PolymerPairInsertionRules` parameter and returns a new `PolymerTemplate` (because I like immutability).
To do this, I wrote the following method:

```java
public PolymerTemplate applyRules(PolymerPairInsertionRules rules) {
    Map<PolymerPair, Long> counts = pairCounts
        .stream()
        .flatMap(count -> rules
            .calculateNewPairs(count.getPair())
            .stream()
            .map(count::withPair))
        .collect(groupingBy(PolymerPairCount::getPair, summingLong(PolymerPairCount::getCount)));
    return new PolymerTemplate(counts);
}
```

In this method, I'll use the `calculateNewPairs()` method to translate each pair to the replacement pairs, and use the `withPair()` method to keep the original count for these new pairs.

For example, if we only had a rule called "AB -> C", the result would become:

- A,C = 1 (the original count of A,B)
- C,B = 1 (the original count of A,B)
- B,C = 1
- C,D = 1
- D,null = 1

However, since multiple insertion rules could create the same pair, we also need to do the same grouping by and counting logic again.
In stead of using `groupingBy()` with `counting()`, I'll use `groupingBy()` with `summingLong()` to determine the sum of the original counts.

The final method is to create a `calculateElementCounts()` method that returns the amount of times each element occurs in the result.
As mentioned before, we can do this by counting the sum of the counts of each left element within a pair.

For example:

```java
public Map<Character, Long> calculateElementCounts() {
    return pairCounts
        .stream()
        .collect(groupingBy(pair -> pair.getPair().getLeftElement(), summingLong(PolymerPairCount::getCount)));
}
```

#### Writing a test

As usual, I implement the challenge itself by using a unit test.

In this case, I started by reading the file and converting it into a `PolymerTemplate` and `PolymerPairInsertionRules` object:

```java
@ParameterizedTest
@CsvSource({
    "/day14_sample.txt,10,1588",
    "/day14_full.txt,10,0" // We don't know the result yet
})
void partOne_elementCount(String fileLocation, int iterations, int expectedOutput) throws URISyntaxException, IOException {
    List<String> lines = readLines(fileLocation);
    List<List<String>> parts = splitLinesByEmptyLine(lines);
    PolymerTemplate template = PolymerTemplate.fromLine(parts.get(0).get(0));
    PolymerPairInsertionRules rules = PolymerPairInsertionRules.fromLines(parts.get(1));
    // TODO: implement
}
```

After that,I need to apply these rules ten times and use the result of one operation as the input of the next one.
The operator that we need to use for this is the `reduce()` operator. For example:

```java
PolymerTemplate result = IntStream
    .range(0, iterations)
    .boxed()
    .reduce(template, (temporaryResult, iteration) -> temporaryResult.applyRules(rules), unsupported());
```

After that, we can call `callElementCounts` to know how often each element appears:

```java
Map<Character, Long> resultCounts = result.calculateElementCounts();
```

The final piece is to subtract the amount of times the most common element occurs, by the amount of times the least common element occurs.
To do that, we no longer need to know the elements, but just the counts.

We could create a separate stream and use `max()` and `min()`.
However, streams like a `LongStream` also come with a collector called `summaryStatistics()`, which calculates both the minimum and maximum at once:

```java
LongSummaryStatistics statistics = resultCounts
    .values()
    .stream()
    .mapToLong(Long::longValue)
    .summaryStatistics();
assertThat(statistics.getMax() - statistics.getMin()).isEqualTo(expectedOutput);
```

And there you have it, part one complete!

### Part 2

Part two confirms our suspicions that the exponentional growth matters.
Why? Well, part two is essentially the same as part one, but now we need to apply the rules 40 times in stead of 10 times.
Luckily we didn't go with our naive solution, since that would cost us about a million million iterations before we know the result.

In stead of that, we can add some new parameters to our parameterized test:

```java
@ParameterizedTest
@CsvSource({
    "/day14_sample.txt,10,1588",
    "/day14_full.txt,10,2967",
    "/day14_sample.txt,40,2188189693529", // Add this
    "/day14_full.txt,40,0" // Add this
})
void partOne_elementCount(String fileLocation, int iterations, int expectedOutput) throws URISyntaxException, IOException {
    // ...
}
```

![Screenshot of my test runner passing all tests](content/posts/2021/2021-12-13-aoc-2021-14/images/test-output.png)

### Conclusion

I'm starting to see a pattern here. Challenges with exponentional growth, like today and day 6 often have the same challenge for parts one and two.
The main difference is that the number of iterations changes drastically, so that you need to come up with a smart solution to avoid running into these exponentional growth issues.

As usual, the full code can be found on [GitHub](https://github.com/g00glen00b/advent-of-code-2021/tree/master/src/test/java/be/g00glen00b/adventofcode/day14).
