---
title: "Dojo inheritance, overriding & extending"
date: "2013-07-20"
featuredImage: "../../images/logos/dojo.png"
categories: ["JavaScript", "Tutorials"]
tags: ["Dojo", "JavaScript"]
excerpt: "In this tutorial I'll show how you can extend existing widgets and how you can create new ones by inheriting from other widgets using Dojo."
---

Dojo is a decent JavaScript framework offering a lot of functionality. One of its biggest trumphs is the possibility to extend modules in an easy way through mixin inheritance. In this tutorial I'm going to show you how you can extend a widget with extra functionality.

### All your base are belong to us

To use inheritance, there are in fact two important modules that will help you with it, namely **dojo/\_base/declare** and **dojo/\_base/lang**. The difference between the two is that you can use the  `declare`\-module to really extend Dojo modules, while with the  `lang`\-module you will extend normal JavaScript objects (both the object as the prototype).

### dojo/\_base/lang

The `lang`\-module has two functions ahat will help you to extend modules, namely `mixin()` and `extend()`. However, these two functions have a fundamental difference, with the `extend()` function you will apply your extensions to the prototype (similar to a "class"), while using `mixin()` you will rather extend the object itself.

An example:

```javascript
require(["dojo/_base/lang"], function(lang) {
   var str = new String("g00glen00b");
    lang.mixin(str, {
        reverse: function() {
           return this.split('').reverse().join('');
        }
    });

    console.log(str.reverse());

    str = new String("g00glen00b");
    console.log(str.reverse());
});
```

In this example I made a `reverse()` function and added it to the `str` object. The first `console.log` will obviously output **b00nelg00g**. However, when I create a new object, the `reverse()` function no longer works. The reason for this is that with the `mixin()` function the `reverse()` function is applied to the first object, but not to the second object.

![lang mixin](images/lang-mixin.png)

Let's try something similar with `lang.extend()`:

```javascript
require(["dojo/_base/lang"], function(lang) {
    var str = new String("g00glen00b");
    lang.extend(String, {
        reverse: function() {
            return this.split('').reverse().join('');
        }
    });

    console.log(str.reverse());

    str = new String("g00glen00b");
    console.log(str.reverse());
});
```

In contrary to the `mixin()` function, the `extend()` function applies it to a class. That's why we're using `String` as a paremter here. So now the `reverse()` function is applied to the `String` class itself, which means it will work for each String object and then it will work for all strings. Both `console.log();` statements will print the reversed string.

![lang extend](images/lang-extend.png)

So, because these functions are applied directly to the JavaScript object or prototype, means you can use them for all kind of things including Dojo widgets (Dijits). For example, if you want to extend `dijit/form/MultiSelect` with sorting capabilities, you could do it using the `lang.extend()` function:

```javascript
lang.extend(MultiSelect, {
    sort: function() {
        var domNodes = Array.prototype.slice.call(this.containerNode.children);
        domNodes.sort(function(a, b) {
            if (a.innerHTML < b.innerHTML) {
                return -1;
            } else if (a.innerHTML == b.innerHTML) {
                 return 0;   
            } else {
                return 1;
            }
        });
        this.containerNode.innerHTML = "";
        array.forEach(domNodes, function(node) {
           this.containerNode.appendChild(node); 
        }, this);
    }
});
```

If you then create a `MultiSelect` widget:

```html
<select id="fruit" data-dojo-type="dijit/form/MultiSelect">
    <option value="LE" selected>Lemon</option>
    <option value="BA">Banana</option>
    <option value="AP">Apple</option>
    <option value="LI">Lime</option>
    <option value="GR">Grapes</option>
    <option value="PI">Pineapple</option>
    <option value="ME">Melon</option>
</select>
```

and the sorting functionality will work:

```javascript
ready(function() {
   registry.byId("fruit").sort(); 
});
```

![multiselect-lang](images/multiselect-lang.png)

So, with the **dojo/\_base/lang** module you can already extend modules on a simple way. What you can't do is inheriting from a module or create submodules based upon it.

For example, in the previous example there is no way to create a `MultiSelect` without the sorting capabilities.

### dojo/\_base/declare

A module that can do that is the declare-module. With the declare-module you can easily write you own widgets by extending already existing widgets, mixins and other APIs.

The entire system of inheriting is used extensively in the Dojo framework. Most widgets extend other widgets and/or mixins. For example, all widgets in Dojo extend from `dijit/_WidgetBase` at a certain point (can be several levels in the hierarchy lower).

The difference between a widget and a mixin is that a mixin offers certain functionality, but is not being able to stand on its own. Most widgets with a template will, for example inherit from `dijit/_TemplatedMixin` which adds a lot of templating functionality to your own widget, but it's not useful to create instances of `dijit/_TemplatedMixin` by yourself. Another common mixin is the `dijit/form/_FormMixin` for form widgets, ... .

If we go back to the previous code example and use the sortable, `MultiSelect`, we can easily convert this to an example using the declare-module:

```javascript
 declare("dijit/form/SortableMultiSelect", [MultiSelect], {
    sort: function() {
        var domNodes = Array.prototype.slice.call(this.containerNode.children);
        domNodes.sort(function(a, b) {
            if (a.innerHTML < b.innerHTML) {
                return -1;
            } else if (a.innerHTML == b.innerHTML) {
                return 0;   
            } else {
                return 1;
            }
        });
        this.containerNode.innerHTML = "";
        array.forEach(domNodes, function(node) {
            this.containerNode.appendChild(node); 
        }, this);
    }
});
```

In this example, the MultiSelect will no longer be sortable, but we did create a custom widget with the name `dijit/form/SortableMultiSelect` that is sortable. The only thing that rests us to do is change the `data-dojo-type` attribute because we're now working with another widget.

![mutliselect-declare](images/mutliselect-declare.png)

The advantage is that we can still keep the current MultiSelect as the SortableMultiSelect.

### Overriding

When you're creating custom modules, you will at one point certainly have to override already existing features. You can do that as well with the declare-module, just add a function to your module with the same name but a different implementation and it's done!

If you still want to call the original function, you can do that from the overriding function by calling:

```javascript
this.inherited(arguments);
```

This is is similar to calling `super` in Java. If you for example want to create a new `DateTextBox` that only allows you to select a date in the future, then you will have to override the `postCreate()` function and add some constraints after initializing the widget.

```javascript
require(["dojo/_base/declare", "dijit/form/DateTextBox", "dojo/parser"], function(declare, DateTextBox) {
    declare("dijit/form/FutureDateTextBox", [DateTextBox], {
        postCreate: function() {
            this.inherited(arguments);
            this.set('constraints', {
                min: new Date()
            });
        }
    }); 
});
```

As you can see we're overriding the `postCreate()` function, but the first thing we do is call `this.inherited(arguments);`. If we don't do that, then the widget will not work because then we would miss the initialization of the widget (which is happening in the original `postCreate()` function but not in ours).

![future-date-textbox](images/future-date-textbox.png)

### Summarized

If you only need to extend a single, **existing** JavaScript prototype or object, then the lang-module will be your best choice. For Dojo modules and widgets the declare-module will be more useful.

That's also the end of this tutorial about inheritance in Dojo.
