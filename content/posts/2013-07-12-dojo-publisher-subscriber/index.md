---
title: "Dojo publisher & subscriber"
date: "2013-07-12"
featuredImage: "../../images/logos/dojo.png"
categories: ["JavaScript", "Tutorials"]
tags: ["Dojo", "JavaScript"]
excerpt: "In this tutorial I'll show how you can use the observer/observable or pub/sub pattern to separate widgets from their behaviour."
---

As a third tutorial about Dojo this month I'm going to talk about a very common design pattern called the observer/observable pattern or also known as the publisher/subscriber pattern. JavaScript is a primary event driven language, the problem that occurs often is that one event might trigger multiple actions. When you have to deal with such code in JavaScript, you can write some spaghetti-code and write callbacks in callbacks in ..., yeah... you get the point, it becomes really messy.

### Divide & conquer

You can make this much easier when you work with the publisher & subscriber pattern. You just send some event and everyone who wants to react on it, reacts. This allows you to seperate both the emitter and the listener. You're not going to put references in both parts, no, the publisher just makes stuff available (independent from the destination) and the subscribers just listen for specific data (independent from the source).

An example, if you have an application with a slidebar and a textual value that represents the slidebar, you can write something like;

_HTML_

```html
<div id="mySlider" data-dojo-type="dijit/form/HorizontalSlider" data-dojo-props="intermediateChanges:true"></div>
<span id="myText">0</span>
```

_JavaScript_

```javascript
require(["dojo/dom", "dijit/registry", "dojo/ready", "dojo/parser", "dijit/form/HorizontalSlider"], function(dom, registry, ready) {
    ready(function() {
        var slider = registry.byId("mySlider");
        slider.set("onChange", function(newValue) {
           dom.byId("myText").innerHTML = newValue; 
        });
    });
});
```

This will certainly work in small examples, but what if another slider has to influence the text as well? Is the one slider really the "master" of the textfield? Not necessarily. For one-to-one relations it's still readable, but if you have multiple sidebars and/or multiple text boxes, things might get messy.

Or what if your JavaScript file has hundreds of lines of code? Then you will have to look everywhere where that single textfield is being modified, while it make more sense if you could seperate the code of the textfield. This is all possible with the publisher/susbcriber pattern where both sides become decoupled. The Dojo toolkit also has a module for this, named **dojo/topic**. If we rewrite the previous example using this module, it may look like:

```javascript
require(["dojo/dom", "dijit/registry", "dojo/ready", "dojo/topic", "dojo/parser", "dijit/form/HorizontalSlider"], function(dom, registry, ready, topic) {
    ready(function() {
        // mySlider code
        var slider = registry.byId("mySlider");
        slider.set("onChange", function(newValue) {
           topic.publish("/MySlider/change", newValue);
        });

        // myText code
        topic.subscribe("/MySlider/change", function(data) {
           dom.byId("myText").innerHTML = data; 
        });
    });
});
```

The good thing about this is that `mySlider` does not have to know about the existence of `myText` and vice versa. The only thing they have to know is how the have to publish the data or subscribe to it.

### Take it all!

The advantages of this approach will be come really visible if you're using multiple widgets that interact with each other. Let's say that we have a text field and a button, the button may only be clickable if at least 10 characters are entered in the text field. Besides that we're also showing a counter with how many characters the textfield already contains.

_HTML_

```html
<input type="text" data-dojo-type="dijit/form/TextBox" id="myTextBox" data-dojo-props="intermediateChanges: true" /><button data-dojo-type="dijit/form/Button" data-dojo-props="disabled: true" id="myButton">Send</button><br />
<span id="myText">0</span>
```

_JavaScript_

```javascript
require(["dojo/ready", "dijit/registry", "dojo/dom", "dojo/topic", "dojo/_base/lang", "dojo/parser", "dijit/form/TextBox", "dijit/form/Button"], function(ready, registry, dom, topic, lang) {
    ready(function() {
       // myTextBox code 
        registry.byId("myTextBox").set("onChange", function(newValue) {
           topic.publish("/myTextBox/newValue", newValue); 
        });

        // myButton code
        var btn = registry.byId("myButton");
        lang.mixin(btn, {
            __setDisabled: function(data) {
               this.set('disabled', data.length < 10); 
            }
        });
        btn.own(topic.subscribe("/myTextBox/newValue", lang.hitch(btn, '__setDisabled')));

        // myText code
        var txt = dom.byId("myText");
        lang.mixin(txt, {
            __setCount: function(data) {
               this.innerHTML = data.length; 
            }
        });
        topic.subscribe("/myTextBox/newValue", lang.hitch(txt, '__setCount'));
    });
});
```

As you can see here, none of the widgets know each other or directly access the other widgets. This makes it much easier to plug in certain widgets or to remove other widgets. The only thing that changes is the data you publish or subscribe to. The implemention of what you do with the provided data is entirely yours. You can also properly seperate your code, as each widget can act independently from the others. If you're not using this pattern, you can only split your code into event handlers, which is harder to read.

I'm also using some extra things in the code above. The first thing is `btn.own(...)`. With it you can connect the subscribe event to a widget. If the widget is destroyed by using  `destroy()`, then it will also destroy the subscriber with it, so no "dead" subscribers are left behind (= subscribers that try to change a non-existing widget).

The second new thing is the use of the **dojo/\_base/lang** module. I'm using this module for two things, I'm using it for `lang.mixin()` , which allows me to extend objects with new functionality. The reasoning behind this is the same as with `btn.own(...)`. When the button is destroyed, then all custom functionality is being destroyed as well. Next to that I'm also using `lang.hitch()`, which allows you to execute a specific function with a seperate context. In this case I'm using it to call the `__setCount` function with the widget context, which means that when we use this in the function, it will actually refer to the widget itself.

### It's everywhere!

The **dojo/topic** module is used in several other Dojo modules that have to share information, for example the[ DnD (drag & drop) widgets](http://dojotoolkit.org/reference-guide/1.9/dojo/dnd.html#summary-of-topics),  the [StackContainer](http://dojotoolkit.org/reference-guide/1.9/dijit/layout/StackContainer.html#published-topics), the Tree (uses it internally), ... . The only question that remains is: "Why aren't you using it?".

With this question I would like to end this (short) tutorial. Important to remember is that by using this pattern you can easily divide your components, improve readability and make it easier to "plug in" extra widgets to a publisher.
