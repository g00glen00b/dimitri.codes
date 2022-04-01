---
title: "Building mobile apps with Dojo mobile (router)"
featuredImage: "../../../images/logos/dojo.png"
categories: ["JavaScript", "Tutorials"]
tags: ["Dojo", "Mobile", "Web"]
excerpt: "Today the world is more mobile than ever, and the web is following this trend. In this tutorial I will create a mobile app using the Dojo Mobile."
---

In the previous tutorial in this series I told you how to set up your project and we already provided our app with some data. Before we actually start writing the application and its behavior, I'm going to write the "glue" between the controllers, the router. Dojo mobile already has a way to transition between views by using the `performTransition` function on a `dojox/mobile/View`. However, this has a few drawbacks:

- You cannot transfer state between the controllers, if view 2 actually needs to display more information about a movie, it needs to know which movie.
- The controller is responsible for the transfer. In my opinion, a controller should not have the reponsibility to "control" another controller.
- It does not "save" some state. There's no way of saying that view 2 wants to go back to view 1, unless you explicitely say you want to go to "view 1". However, this couples both controllers, and in my opinion, "view 2" should not be aware of who executed it.

The router module we're going to introduce actually solves all these issues. It will control the transition between two controllers, so that means that neither controller should be aware of the other one or how it's implemented.  We will introduce a general API in the controllers to provide additional data, the router will use that to inject data that should be passed from controller 1 to controller 2. Finally, because we have a single way of transitioning, we can easily keep a stack of controller transitions and implement the back-functionality without the need of the controller to be aware of who called it.

### Router module definition

A Dojo expert might ask why we don't use the dojo/router module. Indeed, Dojo already has a module that can route your application, but it doesn't allow you to send objects from controller 1 to controller 2. That's why we choose to implement a router ourself.

The router will use the publisher/subscriber design pattern, where each controller is a publisher and the router itself subscribes to the same topic. This means that a controller can send information which the router will receive (and to the necessary stuff to switch the controller/view).

The router will be defined in routes/router.js, so we will edit that file now. The first thing to do when defining a module is writing the define() with the modules we will need, in this module we will need the following:

```javascript
define([
    "dojo/_base/lang", "dojo/_base/array", "dojo/topic", "dojox/mobile/TransitionEvent", "dijit/registry"
], function(lang, arrUtils, topic, TransitionEvent, registry) {
```

The `lang` module contains lots of interesting functions to extend objects and to call certain functions and change the `this` scope. We will use it to create a subscriber and let it interact with our router object. The `arrUtils` contains various utilities for arrays like filtering, mapping, looping, ... we will use it to handle our view-stack to implement the back-functionality. In dojo, the publisher/subscriber pattern is introduced using the `dojo/topic` module. So we will use that module to create our subscriber. The `TransitionEvent` module is used to create a transition between views, which the router needs to do. Finally, the `registry` module contains references to all widgets, including views. We will use this to retrieve the controller/view and inject data into it.

**Heads up!** In our code example, a controller is a `dojox/mobile/View`, while a view is in fact a `templateString` in our controller.

### Router properties

Our module will just return a plain object with some functions and properties. The first thing I'm going to handle are the properties. Right below the `define()`, we will write the following code:

```javascript
var router = {
    transitionStack: new Array(),   
    transitionTopic: "app/transition",
    routes: new Array(),
```

We introduce three properties in our router, the first one (`transitionStack`) containing an array/stack of all controllers that are opened (transitions). The second one is the topic that we will subscribe to. To allow multiple publishers/subscribers, Dojo introduced topic names. Each set of publishers/subscribers are using the same topic, so the subscriber can only listen to messages of publishers using the same topic. In this example we will use the topic `app/transition`.

Finally we will also introduce an array of objects containing the "route ID" and the corresponding ID of the controller. In this example, both the route ID as the controller ID will be the same, but we can change that as well. The advantage of this is that we completely decouple the routing from the registry.

### Router functions

The router will also have some functions that can be used, the first function will be used to verify if the controller is already on the transition stack. If it is, the transition animation should use a backwards animation, if it isn't on the stack yet, we will have a forward animation. The code for this is:

```javascript
contains: function(/** String */ identifier) {
    return arrUtils.indexOf(this.transitionStack, identifier) >= 0;
},
```

We use the `arrUtils` function to check if the stack contains the route identifier already, if its 0 or higher, it means the stack already contains the route ID. If it isn't found, it would return `-1`.

The next function will allow controllers to register themself as a route into the application by adding themself to the `routes` array we discussed earlier. The code for this is:

```javascript
registerRoute: function(/** String */ identifier, /** String */ controllerId) {
    this.routes.push({
        identifier: identifier,
        controller: controllerId
    });
},
```

Nothing special here, except that we push an object to the routes array containing a reference to the identifier of the route and the ID of the controller used to retrieve it from the registry. To improve stability we could add a check if there's already a route object with the same identifier, but in this example we left that out.

The next function is pretty easy as well. The function will in fact retrieve the controller ID based on a given identifier, using the `routes` array we fill using the function described before. The code for this is:

```javascript
getRouteController: function(/** String */ identifier) {
    var routes = arrUtils.filter(this.routes, function(route) {
        return route.identifier === identifier;
    });
    return routes.length === 0 ? null : routes[0].controller;
},
```

We use the `arrUtils` to filter out the routes array until we only keep the route(s) matching the provided identifier. Then we return the ID of the controller or `null` if the identifier is not found (so the filter would return an empty array).

**Heads up!** In JavaScript, comparing should be done with the `===` and `!==` operators because they're strict. This means that it will also verify that the types are equal as well.

The last function is the most difficult one. This function will be used as the topic subscriber callback. Which means that this function actually contains all logic to transition between controllers. The code for this is:

```javascript
executeTransitionCallback: function(/** Object */ data) {
    if (data !== null && data.event !== undefined && data.event !== null && data.original !== undefined && data.original !== null) {
        var isForward = !this.contains(data.identifier);
        var identifier = null;
        if (data.identifier !== undefined && data.identifier !== null) {
            identifier = data.identifier;
        } else {
            identifier = this.transitionStack.pop();
            isForward = false;
        }
        if (data.model !== undefined && data.model !== null) {          
            registry.byId(this.getRouteController(identifier)).set("model", data.model);
        }
        new TransitionEvent(data.event.srcElement, {
            moveTo: this.getRouteController(identifier),
            transitionDir: isForward ? 1 : -1,
            transition: 'slide'
        }, data.event).dispatch();

        if (this.contains(data.original)) {
            this.transitionStack.splice(arrUtils.indexOf(this.transitionStack, data.original), 1);
        } else if (isForward) {
            this.transitionStack.push(data.original);
        }
    }
}
```

The first thing we do here is verify if the `data` object exists (sent with the publisher) and if it contains the properties we need (`event` and `original`). Then we check if the animation should be forward or backwards, by using the `contains()` function we earlier wrote. If the identifier is found on the stack, that means we have to go back to that controller, else we have a new controller, which means the animation should be forward. The next thing we do is to pick the target controller, which we provide through the `identifier` property of the `data` object. If we do not provide such a property, we pick the last one on the transition stack, which means we're transitioning back to the last controller. Just before the transition takes place, we verify if the `data` object contains a `model` property and if it does, we inject it in the target controller.

The next thing we do is to make the transition happen. To do that, we need to create a new `TransitionEvent` and dispatch it immediately using the `dispatch()` function. The transition event requires three parameters:

- The source element that was used to initiate the transition
- The transition properties containing the destination (`moveTo`), animation (`transition`) and animation direction (`transitionDir`)
- The event that initiated the transition

The first and the third parameter are retrieved from the `event` property from the `data` object, while the transition properties depend on the transition stack. The destination is the controller ID of the identifier provided, while the direction depends on if it was already found on the transition stack or not. The transition animation itself is always `"slide"`.

Then finally, we update the transition stack itself. If the destination was already on the stack, we remove it (because we went backwards). If it isn't on the stack and the animation is forward, we can add it to the stack.

### Topic subscriber

The final part of the router is to close the router object itself, initialize a topic subscriber and to return the router object. This is what we will do using the following code:

```javascript
topic.subscribe(router.transitionTopic, lang.hitch(router, "executeTransitionCallback"));
return router;
```

The complete code of the router can be found below:

```javascript
define([
    "dojo/_base/lang", "dojo/_base/array", "dojo/topic", "dojox/mobile/TransitionEvent", "dijit/registry"
], function(lang, arrUtils, topic, TransitionEvent, registry) {

    var router = {
        transitionStack: new Array(),

        transitionTopic: "app/transition",

        routes: new Array(),

        contains: function(/** String */ identifier) {
            return arrUtils.indexOf(this.transitionStack, identifier) >= 0;
        },

        registerRoute: function(/** String */ identifier, /** String */ controllerId) {
            this.routes.push({
                identifier: identifier,
                controller: controllerId
            });
        },

        getRouteController: function(/** String */ identifier) {
            var routes = arrUtils.filter(this.routes, function(route) {
                return route.identifier === identifier;
            });
            return routes.length === 0 ? null : routes[0].controller;
        },

        executeTransitionCallback: function(/** Object */ data) {
            if (data !== null && data.event !== undefined && data.event !== null && data.original !== undefined &&
                data.original !== null) {
                var isForward = !this.contains(data.identifier);
                var identifier = null;
                if (data.identifier !== undefined && data.identifier !== null) {
                    identifier = data.identifier;
                } else {
                    identifier = this.transitionStack.pop();
                    isForward = false;
                }
                if (data.model !== undefined && data.model !== null) {          
                    registry.byId(this.getRouteController(identifier)).set("model", data.model);
                }
                new TransitionEvent(data.event.srcElement, {
                    moveTo: this.getRouteController(identifier),
                    transitionDir: isForward ? 1 : -1,
                    transition: 'slide'
                }, data.event).dispatch();

                if (this.contains(data.original)) {
                    this.transitionStack.splice(arrUtils.indexOf(this.transitionStack, data.original), 1);
                } else if (isForward) {
                    this.transitionStack.push(data.original);
                }
            }
        }
    };

    topic.subscribe(router.transitionTopic, lang.hitch(router, "executeTransitionCallback"));
    return router;
});
```

Right now we finished the most difficult part of this application. The interesting thing is that this module can be reused when necessary, even in other mobile applications. In the next tutorial we will create a module that can be used to publish to the topic we use in this router, so that the routing is actually complete.

### Building mobile apps with Dojo mobile series

1. [Application structure, stores and model](/dojo-mobile-model/)
2. [Routing between controllers](/dojo-mobile-router/)
3. [Controller mixin](/dojo-mobile-controller-mixin/)
4. [Views, controllers and demo](/dojo-mobile-controllers/)
