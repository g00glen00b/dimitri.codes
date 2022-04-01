---
title: "Dojo promises & Deferreds"
featuredImage: "../../../images/logos/dojo.png"
categories: ["JavaScript", "Tutorials"]
tags: ["AJAX", "Dojo", "JavaScript"]
excerpt: "In this tutorial I'll show how you can use deferreds, more commonly known as promises to create asynchronous communication."
---

It's already a while ago I wrote my last tutorial, so it's time for the next one now. In this tutorial I'm going to talk about the Dojo Deferred module, in the JavaScript world also known as promises. As you probably know by now is that JavaScript is a language that makes it easy to work asynchronously and to use callbacks. In theory this all works fine, but if you make an asynchronous call and you would like to do something with the response elsewhere, then it becomes a bit trickier in JavaScript. In the Dojo toolkit you can find a module that may help you, called the **dojo/Deferred** module. In this tutorial I'm going to explain you what you could do with it and how it works.

If you're just working with plain JavaScript and you want a way to work with asynchronous requests, then the best way to do so is by using callbacks. An example:

```javascript
function sum(a, b, callback)  {
    setTimeout(function() {
        callback(a + b);
    }, 5000);
}

sum(2, 3, function(result) {
   alert("The sum is " + result); 
});
```

The function above calculates the sum of two numbers. Due to the `setTimeout()` function the code is working asynchronously and only after a delay of 5 seconds the sum is calculated. Of course, this is something you won't be doing in practice (adding a delay like this), but this is just to easily demonstrate what you could do. In real life, it is often used when working with asynchronous requests (or AJAX calls).

What happens here is that, next to the two parameters to calculate the sum, you're also going to provide a function that will be used as callback. When the asynchronous request is completed, the callback is called with the result. In this case that callback is:

```javascript
function(result) {
    alert("The sum is " + result);
}
```

This code will be executed the moment the callback-function is being called in the  `sum()` function. Right at the moment we use `callback(a + b);`.

This approach works pretty good, even so good that the promises I'm going to talk about are in fact no more than an abstraction layer on top of these callbacks, offering some extra functionality as well. The benefit of these promises is that you don't have to add this callback-stuff by yourself, and that most promise APIs usually have several ways to cancel/pause deferreds and to wait for multiple deferreds at the same time.

### Dojo Deferred

As I said earlier,Dojo has a module called the [deferred module](http://dojotoolkit.org/reference-guide/dojo/Deferred.html "Dojo Deferred") that makes it possible to communicate between "asynchronous threads". If we rewrite the example from before using deferreds, then we get:

```javascript
require(\["dojo/Deferred"\], function(Deferred) {
    function sum(a, b) {
        var def = new Deferred();
        setTimeout(function() {
            def.resolve(a + b);
        }, 2000);
        return def;
    }

    sum(2, 3).then(function(result) {
       alert("The sum is " + result); 
    });
});
```

The major difference is that you no longer have to provide a callback. In stead of that you simply return an instance of `dojo/Deferred`. If you retrieve the result (after 2 seconds in this example), you can use the `resolve()` function to notify that the deferred has been resolved. At that moment the callback in the `then()` function is being executed, containing your result.

The good thing about deferreds is, like I explained earlier, offer extra functionality like error handling. If we make a `divide()` function as well, we don't want it to divide by zero, so we should somehow reject the deferred, which we can do in this way:

```javascript
require(["dojo/Deferred"], function(Deferred) {

    function divide(a, b) {
        var def = new Deferred();
        setTimeout(function() {
            if (b == 0) {
                def.reject("Cannot divide by zero");   
            } else {
                def.resolve(a, b);
            }
        }, 2000);
        return def;
    }

    divide(6, 0).then(function(result) {
        alert("The quotient is " + result); 
    }, function(error) {
        alert("ERROR: " + error);   
    });
});
```

In this example the deferred will be rejected because you can't divide by zero. If you reject a deferred, then the second callback function of the `then()` function is being executed.

### Deferreds in practice

We've now seen how deferreds work using a simple example, but in practice they're used everywhere. For example, if you're writing an AJAX request using the `dojo/request` module, then you will be working with a deferred, for example:

```javascript
require(["dojo/request/xhr"], function(xhr) {
    xhr(myUrl, {
        handleAs: "json"
    }).then(function(result) {
        // Result
    }, function(error) {
        // Error handling
    });
});
```

As you can see we're clearly using deferreds here. To work with the result or provide error handling, we're using the `then()` function of the deferred, just like we did in our example earlier.

### Wait for multiple Deferreds

**Be aware!** The `dojo/DeferredList` module has been deprecated since Dojo 1.8, meaning you should no longer be using this module.

A last thing I want to talk about is how you could wait for multiple deferreds. If you have to wait until multiple deferreds are completed, then you can be using the `dojo/DeferredList` [module](http://dojotoolkit.org/reference-guide/dojo/DeferredList.html "Dojo DeferredList"). This module will only provide a result at the moment all deferreds in the lsit have been resolved or rejected. As a result you will retrieve an array with the results of all deferreds, containing a boolean that will be `true` if the deferred has been resolved and `false` if it isn't.

An example:

```javascript
require(["dojo/Deferred", "dojo/DeferredList", "dojo/_base/array"], function(Deferred, DeferredList, array) {

    function divide(a, b) {
        var def = new Deferred();
        setTimeout(function() {
            if (b == 0) {
                def.reject("Cannot divide by zero");   
            } else {
                def.resolve(a, b);
            }
        }, 2000);
        return def;
    }

    new DeferredList([
        divide(10, 2),
        divide(-10, 2),
        divide(-10, -2),
        divide(10, -2),
        divide(10, 0)
    ]).then(function(result) {
        var succeeded = array.filter(result, function(item) {
           return item[0]; 
        }).length;
        var failed = array.filter(result, function(item) {
            return !item[0];
        }).length;
        alert("All deferreds executed, " + succeeded + " succeeded and " + failed + " failed.");
    });
});
```

As you can see here we're using the  `DeferredList` module to resolve multiple deferreds at once. As a paremter I will be passing in an array of deferreds, in this case it will contain multiple `divide()` operations. If they're all resolved, you will receive a two dimensional array where each row stands for a result. The first object inside that row contains the status, which will be `true` for resolved and `false` for rejected. At the second index you will receive the result or the error message (depending on the status).

In the example, only the last `divide()` operation will fail because we're trying to divide by zero here. To list the number of succeeed and failed items, we filter the result array based on the status element.

The advantage of deferreds has been illustrated here as well. If you would write this code entirely synchronous, you would be waiting 10 seconds until you know all the results. When using deferreds you can execute them all at once, meaning that you will be able to retrieve the results in 2-3 seconds.

With this statement I'm also going to end this (small) tutorial about deferreds.
