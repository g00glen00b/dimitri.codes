---
title: "Testing modern web applications"
date: "2015-03-09"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Testing", "Web"]
---

If you're a web developer like me, then you probably know that writing tests for an application means that you have to test various parts of the application. Modern web architectures usually contain the necessary front-end logic, a REST back-end and some data persistence. Having to test your application means that you want to cover most of these, if not all. So, a while back I wrote [a Spring Boot application](/prototyping-spring-boot-angularjs/ "Rapid prototyping with Spring Boot and AngularJS"), quite a simple one though, but it perfectly shows you how this modern web architecture works. The last couple of weeks I spent some time trying to test each aspect of the application and I wrote some articles about each and every aspect. If you're interested in how to test your application, then here's a small overview:

1. [Writing unit tests using AssertJ and Mockito](/unit-testing-mockito-assertj/ "Unit testing with Mockito and AssertJ")
2. [Integrating Jasmine (JavaScript) tests into your Maven build cycle](/jasmine-tests-maven/ "Executing Jasmine tests with Maven")
3. [Testing your Spring Data Repository with DBUnit](/testing-spring-data-repository/ "Testing your Spring Data JPA repository")
4. [Writing integration tests for your REST API using REST-Assured](/spring-boot-rest-assured/ "Easy integration testing with Spring Boot and REST-Assured")
5. [Writing functional tests using Selenium/FluentLenium](/spring-boot-selenium/ "Testing your Spring Boot application with Selenium")
