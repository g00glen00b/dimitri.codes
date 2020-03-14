---
title: "Using Sinon.js while testing AngularJS applications"
date: "2015-09-29"
coverImage: "jasmine-logo-big.png"
categories: ["JavaScript", "Tutorials"]
tags: ["AngularJS", "Jasmine", "JavaScript", "Sinon.js", "Testing"]
---

I've already done quite some tutorials about testing JavaScript applications, recently about [testing a Meteor application with Jasmine and Sinon.js](/unit-testing-meteor-applications-with-velocity-jasmine-and-sinon-js/). Sinon.js is not only useful to Meteor applications though, and in this article I'll show you how helpful it can be while testing AngularJS applications. [![grunt-jasmine-sinon](images/grunt-jasmine-sinon.png)](https://wordpress.g00glen00b.be/wp-content/uploads/2015/09/grunt-jasmine-sinon.png)

### Project setup

To write a unit test, you obviously need some code. In this case I'm going to use the code of [my previous tutorial](/angularjs-applications-yeoman/), the [dictionary application](https://github.com/g00glen00b/angular-example-dictionary).

The next part we have to do, is to add Sinon.js as a dependency, to do that, open **bower.json** and add the following to the `"devDependencies"`:

```json
"sinonjs": "^1.14.1"
```

This adds Sinon.js as a developer dependency to the project (it's not necessary to run the project). The next step is to add our **application.module.js** file as initial file to load when running our tests. The reason for this is that our module definitions are inside this file, if we don't load it before our actual code or our test, then our tests will fail because it can't find the given module.

So, open **test/karma.conf.js**, and at the `files` configuration add the following line directly below `// endbower` comment:

```javascript
'app/scripts/application.module.js',
```

So the `files` configuration array should look like this:

```javascript
files: [
  // bower:js
  'bower_components/jquery/dist/jquery.js',
  'bower_components/angular/angular.js',
  'bower_components/bootstrap/dist/js/bootstrap.js',
  'bower_components/angular-resource/angular-resource.js',
  'bower_components/angular-mocks/angular-mocks.js',
  'bower_components/sinonjs/sinon.js',
  // endbower
  'app/scripts/application.module.js',
  'app/scripts/**/*.js',
  'test/mock/**/*.js',
  'test/spec/**/*.js'
],
```

The `//bower:js` comment is a placeholder for the Grunt wiredep plugin, it could be that **sinon.js** is not yet in the list above, this can be fixed by building once with Grunt so the wiredep plugin runs.

### Sinon.js

Now, before we start it would be a good idea to first explain what [Sinon.js](http://sinonjs.org/) is. Sinon.js is a framework for stubbing and spying specific calls.

This could be a great addition on your testing toolbelt for AngularJS applications, because developing such applications requires writing a lot of dependencies like services, factories, ... .

To unit test our controllers, we don't need to test the services with it, we would prefer to mock their behaviour, so that we can easily test an isolated case that doesn't depend on other code.

### Creating a test suite

So now we have Sinon.js and AngularJS, we only need a testing framework now... . The [Yeoman generator](https://github.com/yeoman/generator-angular) which we used last time, already includes [Jasmine](http://jasmine.github.io/), so we're going to use that one.

Let's create our testing file within the **test/spec** folder. I usually prefer to use the same directory structure as our source code, so to test the `BrowseController`, I'm going to create a file called **feature-browse/browse.controller.spec.js**. The [AngularJS styleguide](https://github.com/johnpapa/angular-styleguide) which I spoke about in my previous tutorial recommends to have your tests within the same folder as your code (domain driven), but the Yeoman generator doesn't allow that easily without altering too much of its configuration.

Inside the file we just made, we're going to start by defining the test suite:

```javascript
(function() {
  'use strict';

  describe('Browse controller', function() {
    // A test suite
  });
}());
```

Inside the test suite, we first set up our controller and inject a stubbed `Dictionary` service using Sinon.js, for example:

```javascript
var DictionaryStub, vm;
beforeEach(module('dictionaryApp'));

beforeEach(inject(function($controller) {
  DictionaryStub = sinon.stub({
    find: function() { }
  });

  vm = $controller('BrowseController', {
    'Dictionary': DictionaryStub
  });
}));
```

With `$controller`, we can create a specific controller and inject certain dependencies. Sinon.js allows you to stub functions with `sinon.stub()`, but if you provide an object as an argument, it will stub all functions inside it, so in this case we stubbed an object with the function `find()`.

We also declared the variables `vm` and `DictionaryStub` outside the `beforeEach()` function. The `beforeEach()` function has its own scope, executed before each test case, but we want the `vm` and the stubbed service to be available within our tests (= outside the `beforeEach()` scope), so we declared them outside.

### Testing a controller

Jasmine allows you to have nested test suites, I personally like to have a test suite for each function in my controller, because depending on the complexity of the function, you might need to write multiple tests to cover one function.

In this case we have one function called `search()`, so inside the BrowseController test suite, I'm going to create a new test suite called **Searching**:

```javascript
describe('Searching', function() {
  // Nested test suite
});
```

Inside of this test suite we can start writing our first test. To test the `search()` function I'm going to test three aspects:

- Is the `Dictionary.find()` service called?
- Are the `vm.definitions` updated after the service is being called?
- Is the given word provided to the `Dictionary` service?

So, let's see if we can write a test to cover the first aspect:

it('uses the Dictionary service', function() {
  vm.search('word');
  expect(DictionaryStub.find.calledOnce).toBeTruthy();
});

The Sinon.js API allows us to verify if a stubbed/spied function has been called, and how often it was called. In this case we have to verify if it has been called exactly once, and Sinon.js provides a shorthand boolean property called `calledOnce` that will only be `true` if the given function has been called once (and not less or more).

The second test case can also be solved with Sinon.js. Within our controller we us the return value of the `Dictionary.find()` function to fill the `vm.definitions` model. With Sinon.js we can do:

```javascript
it('sets definitions when searching', function() {
  var definition = {
    text: 'Meaning of the word',
    attribution: 'Source or author'
  };
  DictionaryStub.find.returns({ definitions: [definition] });
  vm.search('word');
  expect(vm.definitions.definitions).toContain(definition);
});
```

So, we first mocked a definition, then we used the `returns()` function of Sinon.js to return a specific object when it's called, and then we can verify if the `vm.definitions` indeed contain the given definition.

For the last aspect, we use Sinon.js to retrieve the arguments to a stub, for example:

```javascript
it('searches for the given word', function() {
  vm.search('word');
  expect(DictionaryStub.find.firstCall.args[0].word)
    .toEqual('word');
});
```

With Sinon.js all calls are also saved, and the shorthand `firstCall` gives you access to the "call" object, which has an `args` array containing all arguments. In this case we need to retrieve the first argument, which should be an object that has a property called `word` which should in turn contain the given word.

### Running our tests

With this, we've written tests that cover all aspects of the `search()` function, which is the only function of the Browse controller. To run our tests, open a terminal, go to the project directory and enter the following command:

```
grunt test
```

After a while you'll see that all 3 tests are executed successfully, and the command terminates.

![grunt-test](images/grunt-test.png)

#### Achievement: Used Sinon.js to mock services while testing AngularJS applications

If you're seeing this, then it means you successfully managed to make it through this article. If you're interested in the full code example, you can find it on [GitHub](https://github.com/g00glen00b/angular-example-dictionary). If you want to try out the code yourself, you can download an archive from [GitHub](https://github.com/g00glen00b/angular-example-dictionary/archive/master.zip).
