---
title: "Building mobile apps with Dojo mobile"
featuredImage: "../../../images/logos/dojo.png"
categories: ["JavaScript", "Tutorials"]
tags: ["Dojo", "Mobile", "Web"]
excerpt: "Today the world is more mobile than ever, and the web is following this trend. In this tutorial I will create a mobile app using the Dojo Mobile."
---

The entire web (and even the entire world) is changing. Today the world is more mobile than ever, and the web is following this trend. If you would compare the world 10 years ago to the world now, you will notice that a lot changed in the world of the devices. Desktop computers are making room for tablets and smartphones but also phablets and smartwatches are entering the mobile market.

As a developer, this means you need to adapt to this world, which means you will need to be able to write apps for these devices in a minimum of time. The Dojo Toolkit offers a solution to this problem, the Dojo mobile framework. With the Dojo you can write apps in some of the most common web languages of today: HTML, CSS and JavaScript. These languages work on all devices, and adapts to the size of your screen. Even more, the styling of the application will adapt to the type of device. If you view the app on an iPhone or an Android smartphone, you will notice differences in theming and styles.

![Screenshot1](./images/Screenshot1.png)]
![Screenshot5](./images/Screenshot5.png)

In this series I will start writing a mobile app from scratch using the Dojo Toolkit. We're not going to create a simple hello world example everybody could make, but we're going to develop an application following the most common design patterns like the Model-View-Controller pattern and the Observer/Observable pattern. Our application will contain:

- **Components**: Small UI elements that can be used, can also be seen as widgets.
- **Controllers**: The controllers will contain the code behind a view. These actually have two purposes, the first is to initialize the entire view linked to the controller and the second purpose is to handle the user interaction.
- **Routes**: The code written in the route-package will act as the glue between controllers. Each controller is connected to a single view, so when you need to switch between views (for example, to get a detailed view of some information), this code will be executed to do that switch.
- **Stores**: In Dojo, when providing data, you will use [Dojo stores](http://dojotoolkit.org/reference-guide/1.9/dojo/store.html) in 9 out of 10 cases. This folder will be used to create a store with all model data.
- **Views**: The HTML templates used for each view can be found here. There will be an HTML file for each controller that is created.

The series is divided into four parts, each handling one or more aspects of the application.

1. [Application structure, stores and model](/dojo-mobile-model/)
2. [Routing between controllers](/dojo-mobile-router/)
3. [Controller mixin](/dojo-mobile-controller-mixin/)
4. [Views, controllers and demo](/dojo-mobile-controllers/)

[Demo](http://g00glen00b.github.io/dojox-mobile-app/)
