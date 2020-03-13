---
title: "Write a widget using Dojo (inheritance)"
date: "2014-01-11"
---

In the previous tutorial we did everything we needed to set up our widget like providing our template and the localized messages. In this tutorial I will start writing our widget module by explaining the module system and inheritance.

### Module imports and inheritance

The first step when writing your widget is providing a list of required modules by writing the `define()` function. In this case we need the following modules:

- **dojo/\_base/declare**: This module is used to inherit from other modules, in this case we will inherit from several mixins used to create widgets
- **dojo/\_base/lang**: When you want to call a function, you sometimes want to use the `this` scope. To call a function and modify the `this` scope, you can use this module.
- **dojo/number**: This module contains several utilities for numbers. In this case we will use it to format numbers when we display them (hours, minutes, seconds and milliseconds).
- **dojo/text**: The `dojo/text` plugin allows us to retrieve the content of a file. The file that should be retrieve is entered after the `!` sign, in this case `../views/Stopwatch.html`.
- **dojo/i18n**: This one is a plugin as well, but will provde us with an object containing the correct localized labels by specifying the root locale file behind the `!` sign.
- **dijit/\_WidgetBase**: This module is used a lot when defining your own widget. it provides several things to create your widget and adds several functions to the lifecycle of your widget. We will inherit from this module to make all this functionality available in our widget.
- **dijit/\_TemplatedMixin**: When you want to use templates (and attach points/events), you should inherit from this module as well.
- **dijit/\_WidgetsInTemplateMixin**: The \_TemplatedMixin only allows to use normal DOM nodes as attach points and events. By inheriting from this module as well, you can also use widgets in your template (and as attach points/events).
- **dijit/form/ToggleButton** and **dijit/form/Button**: We included two widgets in our template. When you include widgets in your template, you have to import them as well

The code will look like this:

define(\[
    "dojo/\_base/declare", "dojo/\_base/lang", "dojo/number",
    "dojo/text!../views/Stopwatch.html", "dojo/i18n!app/nls/Stopwatch",
    "dijit/\_WidgetBase", "dijit/\_TemplatedMixin", "dijit/\_WidgetsInTemplateMixin",
    "dijit/form/ToggleButton", "dijit/form/Button"
\], function(declare, lang, NumberUtils, template, nls, \_WidgetBase, \_TemplatedMixin, \_WidgetsInTemplateMixin) {
    return declare("app.components.Stopwatch", \[\_WidgetBase, \_TemplatedMixin, \_WidgetsInTemplateMixin\], {
        /\*\* The widget logic will come here \*/
    });
});

As I told you before, the `define()` function allows us to import all modules we need. When all modules are loaded, the callback function is executed. Each module will be available as a parameter in the callback function. You choose the name yourself, the only thing you have to be sure of is that the order of the modules is the same as the order of the parameters. In this case:

- **dojo/\_base/declare** is mapped on `declare`
- **dojo/\_base/lang** is mapped on `lang`
- **dojo/number** is mapped on `NumberUtils`
- **dojo/text!../views/Stopwatch.html** is mapped on `template`
- **dojo/i18n!app/nls/Stopwatch** is mapped on `nls`
- **dijit/\_WidgetBase** is mapped on `_WidgetBase`
- **dijit/\_TemplatedMixin** is mapped on `_TemplatedMixin`
- **dijit/\_WidgetsInTemplateMixin** is mapped on `_WidgetsInTemplateMixin`

If we don't actually need the callback (which is the case for the `ToggleButton` and `Button`), you can just leave them out.

The next part is that we return our actual module, in this case it will be an object that inherits from \_WidgetBase, \_TemplatedMixin and \_WidgetsInTemplateMixin. We do that by adding an array of the modules we inherit from as the second parameter of the `declare()` function. The first parameter (optional) is the classname of your widget, it's usually the same name as your package/widget name, but replacing the slashes with dots. This also allows you to use your widget in legacy Dojo code (1.6 and lower). The third parameter is the object that will actually contain all our business logic.

### Properties

Just like normal object oriented code, you can define properties (state) and functions (behavior). The first thing we will do now is providing the properties we need. In this case it will be:

return declare("app.components.Stopwatch", \[\_WidgetBase, \_TemplatedMixin, \_WidgetsInTemplateMixin\], {
    templateString: template,
    baseClass: "dijitStopwatch",
    declaredClass: "app.componnents.Stopwatch",
    updateRate: 30,

    \_\_SECMS: 1000,
    \_\_MINMS: 1000 \* 60,
    \_\_HRSMS: 1000 \* 60 \* 60,

    \_\_nls: nls,

    \_\_currentTime: 0,
    \_\_pauseTime: 0,
    \_\_timer: null,
    \_\_started: false,

    /\*\* Our functions will be written down here \*/
});

The first property (code>templateString) is defined by **dijit/\_TemplatedMixin** and allows us to pass our template, which was passed in the `templateString` parameter. If you remember from our previous tutorial, we used a placeholder called `${baseClass}`, which will in fact be substituted by the property called `baseClass`. It is commonly used in Dojo to prefix all your classnames with the base class.

`declaredClass` is similar to the name of the widget, which we entered in our `declare()` statement. You don't have to define this, but it's usually done, so we do that as well. It will also allow us to generate useful IDs for our widgets (when we don't provide an ID). When we generate a widget without ID, it will look like `app_components_Stopwatch_0`.

The `updateRate` property will contain the times per second we update the hours/minutes/seconds/milliseconds field. The higher the value the better the performance (but the user experience is worde) and the lower the value, the more CPU it will consume (and make it slower as well).

The next properties called `__SECMS`, `__MINMS` and `__HRSMS` contain the number of milliseconds in a second, minute and hour. It will allow us to generate a value for the hours, minute and second field. These fields are static (it never changes), so like many other programming languages I will indicate that using uppercase letters. To indicate that this property is private, we prefix it with one or two underscores.

If you remember our previous tutorial, we used placeholders like `${__nls.start}` to enter our button labels. Just like `${baseClass}`, we replace those by having a property called `__nls`. This property will actually be an object containing the translated messages, so in this case, `${__nls.start}` will be replaced by "Start" (or the translated message).

The following properties `__currentTime`, `__pauseTime`, `__timer` and `__started` will be used in our event handling to display the correct time.

This ends the tutorial about Dojo inheritance, in our next tutorial I will finish this module by adding behavior to it.

### Write a widget using Dojo series

1. [Application structure, templating and localization](http://wordpress.g00glen00b.be/dojo-widget-resources/)
2. [Modules, inheritance and object state](http://wordpress.g00glen00b.be/dojo-widget-inheritance/)
3. [Module behavior](http://wordpress.g00glen00b.be/dojo-widget-behavior/)
4. [Finishing the application and demo](http://wordpress.g00glen00b.be/dojo-widget-demo/)
