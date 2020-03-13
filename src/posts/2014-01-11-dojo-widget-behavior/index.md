---
title: "Write a widget using Dojo (behavior)"
date: "2014-01-11"
---

In the previous tutorial we finally started writing our module. However, we didn't do anything fancy yet except using inheritance and writing down our properties. If you remember the first tutorial, we created several attach points and events, which we're going to use now to finish our stopwatch.

### Event handling

If you remember the first tutorial, we connected to two events, the `onChange` event of the `ToggleButton` was connected to `onStart` and the `onClick` event of the normal Butto nwas connected to `onReset`. We're going to implement these event handlers now. They're nothing more than functions added to our module:

onStart: function(newValue) {
    if (newValue && !this.\_\_started) {
        this.\_\_start();
    } else if (!newValue && this.\_\_started) {
        this.\_\_stop();
    } else {
        this.\_\_resume();
    }
},

onReset: function() {
    this.\_\_pauseTime = 0;
    this.\_\_started = false;
    this.\_\_render(0);
},

Our start button will have multiple purposes. When it's clicked for the first time, it will start the stopwatch. When it's clicked afterwards, it will pause the stopwatch and if it's clicked another time, it will resume the stopwatch. That's why we use this `if` structure to implement these situations. We also reference to three new functions called `__start()`, `__stop()` and `__resume()`. The reset event handler is a bit easier, it will actually disable the pause (because we're actually resetting the timer to zero), then we set the `__started` property to `false` so when the stopwatch is restarted, it will actually act as if it's started for the first time (from the beginning). It will also have to set the displayed time to zero as well, that's what we will do using the `__render` function.

### Starting the stopwatch

We're now going to implement all these new functions we referred to already, the first one being `__start()`. This one is actually quite easy:

\_\_start: function() {
    this.\_\_started = true;
    this.\_\_currentTime = this.\_\_getTime();
    this.\_\_startTimer();
},

It wil set `__started` to `true` (so next "start" is actually a "resume"), it will set the current time (milliseconds since epoch). This will be used to see what the difference is between the current time and the time the watch was started (which is actually the time we need to display). The code for the `__getTime()` function is the most easy one:

\_\_getTime: function() {
    return new Date().getTime();
},

We will also start a timer using the `__startTimer()` function.

The `__startTimer` is easy as well, it actually uses `setInterval()` to repeat a block of code countless times. The implementation of this function is:

\_\_startTimer: function() {
    this.\_\_pauseTime = 0;
    this.startBtn.set("label", nls.stop);
    this.resetBtn.set("disabled", true);
    this.\_\_timer = setInterval(lang.hitch(this, "\_\_render"), this.\_\_SECMS / this.updateRate);           
},

it will reset the `__pauseTime` (which I will talk about later), change the label of the start button to "Stop" and it will make sure the reset button is still disabled by setting the **disabled** property to `true`. If it's called for the first time it isn't really useful (since it's already disabled), but we will reuse this function when we implement the **resume** functionality. If you remember our first tutorial, we gave both buttons a `data-dojo-attach-point` and because of this, we can now refer to these buttons using `startBtn` and `resetBtn`, all thanks to the **dijit/\_TemplatedMixin** and **dijit/\_WidgetsInTemplateMixin** modules.

The last thing we do is set an interval to call the `__render()` function. We use the **dojo/\_base/lang** function for this, because the `setInterval()` will change the `this otherwise (because it's not called from the widget anymore). To make sure that` `this` still refers to the current widget, we use the `hitch()` function.

The repeat interval is calculated upon the `updateRate` property. This property is actually the intervals per second, so to know how long the interval should be, we divide 1000 (`this.__SECMS`) to the `updateRate`.

### Stopping and resuming the stopwatch

If we started the stopwatch, the next thing we can do is stopping/pausing it using the `__stop()` function. This one is easy as well:

\_\_stop: function() {
    clearInterval(this.\_\_timer);
    this.startBtn.set("label", nls.resume);
    this.resetBtn.set("disabled", false);
    this.\_\_pauseTime = this.\_\_getTime();
},

The first thing we do is make sure that the interval we created before, is stopped (so the stopwatch stops as well). Then we change the label of the start button to **Resume** and enable the reset button. We now add the current time to `__pauseTime`. The reason for this is that if we resume the stopwatch, we need to make sure that it's actually substracting the time that the stopwatch was paused.

The `__resume()` function is similar to `__start()`, but in stead of setting the current time (`__currentTime`) to the current time, we add the time it was paused to it. Now the difference between the current time and the value in `__currentTime`) is smaller, because the time it was paused is substracted from it. The code for this:

\_\_resume: function() {
    if (this.\_\_pauseTime !== 0) {
        this.\_\_currentTime += (this.\_\_getTime() - this.\_\_pauseTime);
    }
    this.\_\_startTimer();
},

As you can see we also check if the `__pauseTime` is not zero. If you remember well, the `onReset` sets this property to zero, meaning that the pause should not be calculated.

### Displaying the time

We now implemented starting, stopping, resuming and resetting the stopwatch, but what we didn't provide yet is the `__render()` function we call from `__setTimer()` and `onReset()`. As you can see, this function accepts one optional parameter. If this parameter is added, it will use that as the current time (in stead of the difference of the current time and `__currentTime`. That means if we provide zero to it, it will actually reset the stopwatch and show only zeros.

The implementation looks hard, but it's quite repetitive.

\_\_render: function(milli) {
    if (milli === undefined) {
        milli = this.\_\_getTime() - this.\_\_currentTime;
    }
    var hrs = milli / this.\_\_HRSMS;
    milli = milli % this.\_\_HRSMS;
    var mins = milli / this.\_\_MINMS;
    milli = milli % this.\_\_MINMS;
    var secs = milli / this.\_\_SECMS;
    milli = milli % this.\_\_SECMS;

    this.hoursNode.innerHTML = this.\_\_format(hrs, "00");
    this.minutesNode.innerHTML = this.\_\_format(mins, "00");
    this.secondsNode.innerHTML = this.\_\_format(secs, "00");
    this.milliNode.innerHTML = this.\_\_format(milli, "000");
},

I already explained the `if` statement already, the next step is that it actually calculates the "hour", "minute", "second" and "millisecond" part from `milli`. To calculate that, we actually need to divide that value by the number of milliseconds in an hour (`__HRSMS`). Then the part that is still left over which we calculate using the modulo operator (`%`) should be divided by the number of milliseconds in a minute (to get the minute part). We do the same for the seconds and the final leftover is what's the real milliseconds value.

We can then display these values by setting the `innerHTML` of our different nodes. If you remember our first tutorial, we gave each part a `data-dojo-attach-point`, we can now use that attach point to set the displayed content all thanks to the **dijit/\_TemplatedMixin** module.

You can see we actually use a `__format` function, which will use the **dojo/number** module to round the numbers and add leading zeros to it. The implementation of this function:

\_\_format: function(value, pattern) {
    return NumberUtils.format(value, {
        pattern: pattern
    });
},

### Initializing the widget

There's only one thing we're going to do and that's making sure that the stopwatch is reset when it's loaded for the first time. Normally that's already the case because we placed zeros in the template, but we can manually do that as well by resetting using the `__render(0)` function. Thanks to the **dijit/\_WidgetBase** module, our widget has a `postCreate` function that is automatically called when the template is rendered and all widgets in the template are processed so that our widget is actually ready to use. We can use that function to reset the stopwatch at that time using:

postCreate: function() {
    this.inherited(arguments);
    this.\_\_render(0);
}

The first line, `this.inherited(arguments);` makes sure that the `postCreate` function of all inherited modules is also ran, in this case **dijit/\_WidgetBase**, **dijit/\_TemplatedMixin** and **dijit/\_WidgetsInTemplateMixin**. This is always a good practice to do if you're using functions that are inherited from one (or multiple) modules.

This makes our module complete and so it ends our tutorial. In the next tutorial I will finish the entire application and demonstrate what we actually have done until now.

### Write a widget using Dojo series

1. [Application structure, templating and localization](http://wordpress.g00glen00b.be/dojo-widget-resources/)
2. [Modules, inheritance and object state](http://wordpress.g00glen00b.be/dojo-widget-inheritance/)
3. [Module behavior](http://wordpress.g00glen00b.be/dojo-widget-behavior/)
4. [Finishing the application and demo](http://wordpress.g00glen00b.be/dojo-widget-demo/)
