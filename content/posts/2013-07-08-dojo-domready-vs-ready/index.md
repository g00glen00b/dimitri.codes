---
title: "Dojo domReady vs ready"
date: "2013-07-08"
featuredImage: "../../images/logos/dojo.png"
categories: ["JavaScript", "Tutorials"]
tags: ["Dojo", "JavaScript"]
excerpt: "In this tutorial I'll explain the difference between the dojo domReady and ready modules."
---

One of the biggest misconceptions in Dojo is what module to choose to create a document-on-load event handler. In Dojo there are two modules that are commonly used, called **dojo/ready** and **dojo/domReady**. In this small tutorial I will explain you what the differences are and in what situation you should use them.

### Syntax

If we only look at the syntax, you may notice that they're being used differently. For example:

The **dojo/ready** module is just a simple module that allows you to provide a callback that will be executed when ready.

```javascript
require(["dojo/ready"], function(ready) {
    ready(function() {

    });
});
```

The **dojo/domReady!** module plugin on the other hand will only complete being loaded if the DOM is loaded. Because it delays the loading process, it means you no longer need a callback, because the module loader callback itself is being delayed. A code example:

```javascript
require(["dojo/domReady!"], function() {
    ...
});
```

You probably noticed that I called **dojo/domReady** a plugin in stead of a module. Well, in Dojo there are both plugins and modules. A plugin is in fact a module that allows parameters when being loaded. The parameter that you provide should be aded behind the exclamination mark. Another common plugin is **dojo/text**, for example:

```javascript
require(["dojo/text!template.html"], function(template) {
    ...
});
```

As you can see clearly here, we're adding a parameter `template.html` to the end of the **dojo/text** plugin. This plugin will then load the contents of that file. When you're using plugins, you always have to use the exclamination mark. Even when you don't have to provide data to the plugin, you still use it. So you will always write **dojo/domReady!** but never **dojo/domReady**.

The **domReady** plugin can be written in a similar way as the **ready** module though, the following will work as well:

```javascript
require(["dojo/domReady!"], function(domReady) {
    domReady(function() {

    });
});
```

### dojo/ready uses dojo/domReady

The title makes some things clear already. Because **dojo/ready** uses **dojo/domReady**, it means that it can do something extra/additional compared to the domReady module. The "extra things" are in fact extra preconditions that should be met before the **dojo/ready** callback is being executed.

The **dojo/domReady** plugin only requires 1 condition to be met, namely the DOM should be loaded. If the DOM is loaded, then the callback will be executed. The **dojo/ready** plugin on the other hand has two extra pre-conditions:

- The DOM must be loaded (same as **dojo/domReady**)
- (All AMD modules in that block have to be loaded)
- All other `ready()` callbacks with a higher priority should have been executed

The reason I added the second point between brackets is because it always happens by default. The Dojo AMD loader will only execute the callback when all modules are loaed. Also, because the **dojo/domReady!** plugin is executed only when the DOM is ready and the AMD loader only executed when all modules are ready, this module in fact does the same as well. For example:

```javascript
require(["dojo/text!template.html", "dojo/dom", "dojo/dom-construct"], function(template, dom, domConstruct) {
    // This callback is only executed if dojo/text, dojo/dom and dojo/dom-construct are loaded
});
```

### Priority?

So the big difference that remains is the priority you can pass to the **dojo/ready** module. When using the  `ready()` function you can in fact add more than just a callback. You can also add a priority. The lower the priority number, the faster it will be executed. For example:

```javascript
require(["dojo/ready"], function(ready) {
    ready(1500, function() {
        console.log("I'm second");
    });

    ready(1200, function() {
        console.log("I'm first");
    });
});
```

Because the second `ready()` statement has a lower priority number, it will be executed before the other one, even though it's declared after the other one. This becomes really useful when you're working with Dojo widgets (for example using the **dijit** library). If you used those, then you probably know there is a module called **dojo/parser** to parse the DOM into widgets. You can also do that automatically by using the `data-dojo-config` attribute with the `parseOnLoad` property. The good thing is that the automatic parser makes use of the **dojo/ready** module to load only when the DOM is loaded. So, if you know the priority, you can execute your code before the parsing happened, or after the parsing. Something you can't do with the **dojo/domReady** module.

Some priorities that might be useful to remember:

| Priority | Description |
| -------- | ----------- |
| 80 | This is the priority used by the `parseOnLoad` mechanism. Prioriteities of 79 and lower will be executed before the parsing happened, while priorities of 81 and higher will be executed after the parsing happened. |
| 1000 | This is the default priority if you're not manually defining a priority (like in the first example) |

### Some other benefits

You can also provide a context to the **dojo/ready** module, for example:

```javascript
require(["dojo/ready"], function(ready) {
    var myObject = {
        test: "Hello world"
    };
    ready(myObject, function() {
        console.log(this.test); // Hello world
    });
});
```

By providing a context you can change the object the `this` context points to. In this case it means it will refer to `myObject`. This can be quite convenient when you want to make sure that the callback of the `ready()` function is in fact a part of the object, for example:

```javascript
require(["dojo/ready"], function(ready) {
    var myObject = {
        test: function() {
            ...
        }
    };
    ready(myObject, 'test');
});
```

In this example `myObject.test()` will be called if the conditions from the **dojo/ready** module are met.

### Summarized

Summarized you could say that in most cases the **dojo/domReady** plugin will be sufficient. Only when you're starting to use the `parseOnLoad` auto parsing mechanism, then the **dojo/ready** module becomes convenient because you can control which code will be executed before or after the parsing happens. This is very important when you're using the **dijit/registry** module to retrieve a widget instance. If you're not using the proper module, you will probably not be able to find the widget, because the parsing did not occur yet.

With the **dojo/domReady** plugin there is no priority queue, all code will be executed immediately after the DOM is loaded (probably before the widgets are parsed). Many people starting with Dojo are usually having troubles with these and notice that their widgets are not behaving as they should be, simply because they're not using **dojo/ready**. So make sure that when you're encountering a similar problem that you're using the correct module or plugin.
