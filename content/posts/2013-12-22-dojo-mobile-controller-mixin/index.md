---
title: "Building mobile apps with Dojo mobile (controller mixin)"
date: "2013-12-22"
featuredImage: "../../images/logos/dojo.png"
categories: ["JavaScript", "Tutorials"]
tags: ["Dojo", "Mobile", "Web"]
excerpt: "Today the world is more mobile than ever, and the web is following this trend. In this tutorial I will create a mobile app using the Dojo Mobile."
---

In the third part of this series I will tell you how to create controllers and views and how to re-use certain parts of your view (like the header) in all your views.

In the previous tutorial I told you how to create a router, which will act as a topic listener. However, we didn't provide any topic publisher yet.  The controller mixin will have multiple purposes, but one of it will be providing an API to transition. The controller mixin can be compared to an abstract class. It offers various functions and APIs, but on its own it's not useful, it has to be inherited from other controllers. In this example, all controllers have to inherit from the controller mixin. The controller mixin will have the following purposes:

- Provide an API to transition between controllers using a topic publisher
- Provide a way to inherit templates so that other controllers don't have to define their own header or tabbar.

### Module definition

The first thing to do, like usual, is to define the modules we need using the `define()` function, in `controllers/_ControllerMixin.js` we need the following modules:

```javascript
define([
    "dojox/mobile/View",
    "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
    "dojo/_base/declare", "dojo/text!../views/application.html", "dojo/topic",
    "../routes/router",
    "dojox/mobile/Heading", "dojox/mobile/ScrollableView"
], function(View, _TemplatedMixin, _WidgetsInTemplateMixin, declare, template, topic, Router) {
```

The `dojox/mobile/View` is the baseclass which this module will extend. It represents a plain view on your mobile application, and as I told you in the previous tutorials, a `dojox/mobile/View` is in fact our **controller**. The following two mixins called `_TemplatedMixin` and `_WidgetsInTemplateMixin` provide a way to use a template. The last one also provides a way to use declarative notation of widgets inside our template.

The `declare` module is commonly used when your module should be able to inherit from other modules and instantation should be possible. In this example we will use it to inherit from `dojox/mobile/View`, `dijit/_TemplatedMixin` and `dijit/_WidgetsInTemplateMixin`.

The next module we use is `dojo/text` which should sound familiar from the first tutorial in this series when we retrieved the content from `movies.json`. This module (actually it's a plugin), can be used to retrieve the contents of any file, in this case, our view containing the base template. Then, we also need `dojo/topic` like we did in our router. This time it won't be used to create a subscriber, but to create a publisher. The `router` will be used to register the controller as a route and to retrieve the topic that the controller should publish to. Finally we import some modules we need to make the template work, in this case a heading widget and a scrollable view.

### Declaration

As I told before, we will use the `declare` module to inherit from other modules. In this example we will use the following code:

```javascript
return declare([View, _TemplatedMixin, _WidgetsInTemplateMixin], {
// Mixin logic
});
```

The next thing we do is defining the properties we need. These are:

```javascript
templateString: template,
innerTemplate: null,
model: null,
```

The `_TemplatedMixin` allows us to use a template. This template should be provided by using the `templateString` property. I will talk about the template later in this tutorial, but in this template we will define the header and a placeholder of where the content should be put. The next property `innerTemplate` is actually a reference to that placeholder. Controllers that change this property, will see that their content is injected in the main template.

Finally, the `model` property contains the data that is sent by the router. If you remember our previous tutorial, to inject the data we used:

```javascript
registry.byId(this.getRouteController(identifier)).set("model", data.model);
```

This actually sets the `model` property of the corresponding controller.

### Behavior

The behavior of the mixin will be provided by certain functions. There are actually two functions we provide (and override a third one). The first function is a function to make it possible to create a transition. The code for this is:

```javascript
transition: function(/** String */ identifier, /** Event */ event, /** Object */ model) {
    var controller = this;
    topic.publish(Router.transitionTopic, {
        model: model,
        event: event,
        identifier: identifier,
        original: controller.id
    });
},
```

It publishes to the topic we defined in our router and just passes the arguments as an object (which will be used as the `data` object in the router).

The second function is quite similar, except that we will use it to create a back-transition. As we know from the previous tutorial, all we have to do is leave the `identifier` property away, so that the router will just use the last identifier from the transition stack as the destination. The code for this is:

```javascript
transitionBack: function(/** Event */ event, /** Object */ model) {
    var controller = this;
    topic.publish(Router.transitionTopic, {
        model: model,
        event: event,
        original: controller.id
    });
},
```

Then the last function will be used when initializing the controller, so that it actually registers the controller as a route in the router. We use the `postCreate` function for that (will be executed after creating the controller). The code for this is quite easy:

```javascript
postCreate: function() {
    this.inherited(arguments);
    Router.registerRoute(this.id, this.id);
}
```

This actually does two things, the second one is the easiest, we use it to register the route in our router. The first one makes sure that when we override the `postCreate` function, we actually also call the `postCreate` function from the inherited module, in this case the `_TemplatedMixin`. This way we can make sure no functionality is broken.

The complete code of the controller mixin can be found below:

```javascript
define([
    "dojox/mobile/View",
    "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
    "dojo/_base/declare", "dojo/text!../views/application.html", "dojo/topic",
    "../routes/router",
    "dojox/mobile/Heading", "dojox/mobile/ScrollableView"
], function(View, _TemplatedMixin, _WidgetsInTemplateMixin, declare, template, topic, Router) {

    return declare([View, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        innerTemplate: null,

        model: null,

        transition: function(/** String */ identifier, /** Event */ event, /** Object */ model) {
            var controller = this;
            topic.publish(Router.transitionTopic, {
                model: model,
                event: event,
                identifier: identifier,
                original: controller.id
            });
        },

        transitionBack: function(/** Event */ event, /** Object */ model) {
            var controller = this;
            topic.publish(Router.transitionTopic, {
                model: model,
                event: event,
                original: controller.id
            });
        },

        postCreate: function() {
            this.inherited(arguments);
            Router.registerRoute(this.id, this.id);
        }
    });
});
```

### Main view/template

As I told before, the controller mixin has two purposes, one being providing APIs to transition (which we completed) and the other one being providing a way to re-use template code. As I told before, we will do that by using a placeholder called `innerTemplate` which we will define in our view. The main view can be changed at **views/application.html**. In this example it will contain:

```html
<div>
    <h1 data-dojo-type="dojox/mobile/Heading" data-dojo-attach-point="headerNode">
        Movies
    </h1>
    <div data-dojo-type="dojox/mobile/ScrollableView">
        ${!innerTemplate}
    </div>
</div>
```

As you can see here, we have a heasing `<h1>`. We actually convert it to a heading widget by providing the type of the widget in the `data-dojo-type` attribute. This is the same module we imported earlier when we defined the modules for the mixin. To access widgets or DOM nodes from within our controller code (or mixin code), we use an attach point which we define using the `data-dojo-attach-point` attribute.

In this case, the controller mixin will have a reference to the heading widget by using the `headerNode` property. We will use this in on of our controllers to add a back button to it.

Then we define a scrollable view, which means we can drag the view up and down. This scrollable view will contain the content of the controller itself. We do that by providing a placeholder, in this example being `${!innerTemplate}`. The exlamination mark is used to indicate that content that is replaced in this placeholder should not be escaped, if we didn't do that, all HTML entities would be encoded.

At this point, we still haven't written our application (except the base template). The controller mixin and the router are general modules that can be used in any mobile application, which is another advantage of decoupling your code as much as possible. In the next tutorial we will finally create our application.

### Building mobile apps with Dojo mobile series

1. [Application structure, stores and model](/dojo-mobile-model/)
2. [Routing between controllers](/dojo-mobile-router/)
3. [Controller mixin](/dojo-mobile-controller-mixin/)
4. [Views, controllers and demo](/dojo-mobile-controllers/)
