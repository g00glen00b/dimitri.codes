---
title: "E2E testing with Nightwatch.js"
featuredImage: "/logos/nightwatch.png"
categories: ["JavaScript", "Tutorials"]
tags: ["E2E", "JavaScript", "Nightwatch.js", "Testing"]
excerpt: "Today I'm also going to test an AngularJS application, but this time I will be using Nightwatch.js. While Nightwatch.js is not made specifically for AngularJS applications, you can use this framework as well."
---

A while back I wrote some tutorials about [E2E testing with FluentLenium](/spring-boot-selenium/) (Java), [E2E testing for Meteor using Velocity](/e2e-testing-your-meteor-app-with-cucumber-webdriverio-and-chai/) and recently [E2E testing AngularJS applications using Protractor](/e2e-testing-angularjs-applications-with-protractor/). Today I'm also going to test an AngularJS application, but this time I will be using [Nightwatch.js](http://nightwatchjs.org/). While Nightwatch.js is not made specifically for AngularJS applications, you can use this framework as well.

### Installation

To install Nightwatch.js you need two things:

- A [Selenium](http://www.seleniumhq.org/) server
- Nightwatch.js test runner

The first one can be installed by installing **webdriver-manager**, the second one by installing **nightwatch** itself:

```
npm install -g nightwatch webdriver-manager
```

Now update and install the Selenium server by executing the following commands:

```
webdriver-manager update
webdriver-manager start
```

### Set up

This time I'm not going to write/test my own application, but I will be testing the [AngularJS TodoMVC application](http://todomvc.com/examples/angularjs/#/).

![nightwatch-angular](./images/nightwatch-angular.png)

Create a new project, and inside it create a folder structure **tests/e2e**. Within the tests folder create a file called **nightwatch.json**. This file will be used to configure Nightwatch for running our tests. Now open the configuration file and add the following JSON configuration:

```json
{
  "src_folders" : ["./tests/e2e"],
  "test_settings" : {
    "chrome" : {
      "desiredCapabilities": {
        "browserName": "chrome",
        "javascriptEnabled": true,
        "acceptSslCerts": true
      }
    }
  }
}
```

This will tell Nightwatch where to find our tests, and w're also providing a profile called Chrome, which will run the Chrome browser for our tests. If you want to use a different browser or deifferent settings, you best take a look at the [configuration docs](http://nightwatchjs.org/guide#settings-file).

### Writing our first test

Now, with our Selenium server running and our configuration configured, it's time to write our first test.

You'll see that writing Nightwatch.js tests is a bit different from other frameworks, because Nightwatch is all about chaining.

In our first test we're going to check if the footer and task regions are hidden when there are no tasks. This is the default behaviour of the [TodoMVC application](http://todomvc.com/examples/angularjs/#/).

To create a new test suite, create a new file in the **tests/e2e** folder called **overview.spec.e2e.js**. Since all test files are Node.js modules, we need to use the following export syntax inside that file:

```javascript
module.exports = {
  // Tests
};
```

Now for our first test, to see whether or not the tasks section is visible or not, I wrote the following test:

```javascript
'Does not show the task list if there are no tasks': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/')
    .waitForElementVisible('#header h1', 1000)
    .assert.hidden('#main')
    .end();
},
```

So, what I'm doing here is, first I'm going to the application page. Then, because the page is loaded through an `ng-view` I'm waiting until that view is visible by waiting for the header on that page (`#header h1`). When that's loaded, I'm testing if the element with the id `#main` is hidden (which should be `true` if there are no tasks). With the `end()` chain I'm going to tell to close the current browser. If you forget to add the `end()`, you'll see that your test still works, but if you write multiple tests in the same file, it will preserve stat, meaning that your tests might fail because the data of earlier tests is not being removed.

For assertions there are several options, listed in the [API reference](http://nightwatchjs.org/api#assertions).

Also note that there is also a more BDD assertion API, using the [Expect API](http://nightwatchjs.org/api#expect-api). For example, for our first test the assertion would be: `.expect.element('#main').to.no.be.visible`. Whether you use it is up to you, just try to remain consistent in all your tests.

Testing whether or not the footer is visible, is very similar to our previous test and needs no further explanation:

```javascript
'Does not show the footer if there are no tasks': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/')
    .waitForElementVisible('#header h1', 1000)
    .assert.hidden('#footer')
    .end();
},
```

The next aspect I'm going to test is whether or not the new task input field is focused when opening the application. To do that I can use the `:focus` CSS selector, which should only return focused elements. Apply that to the `#new-todo` input field and your test will only succeed if that element is indeed focused:

```javascript
'Does initially focus on the input field': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/')
    .waitForElementVisible('#header h1', 1000)
    .assert.elementPresent('#header #new-todo:focus')
    .end();
},
```

With `elementPresent()` we can check whether or not an element exists. It does not have to be visible though.

With the next test we're going to test the behaviour of the application a bit more. When we enter a new task in the input field and submit, a new task should be added to the list. So let's test that:

```javascript
'Shows todo items': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/')
    .waitForElementVisible('#header h1', 1000)
    .setValue('#new-todo', 'My new task')
    .submitForm('#todo-form')
    .assert.containsText('#todo-list li:first-child label', 'My new task')
    .end();
},
```

The first few lines remain the same, but with `setValue()` we set a value to the input field with ID `#new-todo`. After that, we submit the form using `submitForm()` and verify if the `#todo-list` has an item with a label with the same text as the value we entered earlier.

Now, the next test goes even farther, by not only adding a new task, but also by completing the task itself and verifying if it has been stricken through:

```javascript
'Strikes through completed items': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/')
    .waitForElementVisible('#header h1', 1000)
    .setValue('#new-todo', 'My new task')
    .submitForm('#todo-form')
    .click('#todo-list li:first-child .toggle')
    .assert.cssClassPresent('#todo-list li:first-child', 'completed')
    .end();
},
```

We don't really verify if there's a line through the text here, but we verify if the `completed` class is present. The CSS for this class provides the line through the text. To check an element we used the `click()` API to click on the checkbox itself.

Now, we already verified that you can add and complete tasks. With the next test we're going to see if the counter at the bottom of the application shows the correct amount of tasks that are left.

To do that, we simply add and complete some tasks and verify if the number changes appropriately:

```javascript
'Shows how many items there are left': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/')
    .waitForElementVisible('#header h1', 1000)
    .setValue('#new-todo', 'My new task')
    .submitForm('#todo-form')
    .setValue('#new-todo', 'My other new task')
    .submitForm('#todo-form')
    .assert.containsText('#todo-count', '2 items left')
    .click('#todo-list li:first-child .toggle')
    .assert.containsText('#todo-count', '1 item left')
    .end();
},
```

Nothing new here. We add two elements, verify if the text matches `'2 items left'`, then we complete a task and verify if there is only `'1 item left'`.

For the final test of the overview, we're going to verify if we cannot add a task if we don't enter a value in the textbox or if we only enter spaces:

```javascript
'Does not add empty or blank tasks': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/')
    .waitForElementVisible('#header h1', 1000)
    .setValue('#new-todo', 'My new task')
    .submitForm('#todo-form')
    .submitForm('#todo-form')
    .setValue('#new-todo', '  ')
    .submitForm('#todo-form')
    .assert.containsText('#todo-count', '1 item left')
    .end();
}
```

So, what we did here is nothing really new. We add a proper task, then try to submit the form without entering a new value and finally we enter some spaces and try to submit again. In neither of these cases a task should be added. So there should only be 1 item left, the first, and valid, task we added.

### Testing the filters

We now tested most of the basic functionality of the application. However, there are still some things left to test. In this part I'm going to test the filters at the bottom of the application (All/Active/Completed).

I'm going to put these tests in a separate file, so that each feature of the application gets a separate test suite. Let's create a file called **filters.spec.e2e.js**.

For the first test I'm going to add a task and verify if the task is visible when using that filter:

```javascript
module.exports = {
  'Active filter shows non-completed items': function(client) {
    client
      .url('http://todomvc.com/examples/angularjs/#/active')
      .waitForElementVisible('#header h1', 1000)
      .setValue('#new-todo', 'My new task')
      .submitForm('#todo-form')
      .assert.containsText('#todo-list li:first-child label', 'My new task')
      .end();
  },

  // Other tests here
};
```

Nothing new here, but notice that we're using a different URL now (`/#/active`). In stead of manually clicking (which is also possible), I directly went to the application using the active filter. So other than using a different URL, this test is very similar to the test we wrote earlier to test if we can add tasks.

For the next test I'm going to verify that there are no tasks visible if there are only completed tasks:

```javascript
'Active filter hides completed items': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/active')
    .waitForElementVisible('#header h1', 1000)
    .setValue('#new-todo', 'My new task')
    .submitForm('#todo-form')
    .click('#todo-list li:first-child .toggle')
    .assert.elementNotPresent('#todo-list li')
    .end();
},
```

We simply add and complete a task, and verify there are no items within `#todo-list` by using `elementNotPresent()`. It's very important to understand the different between `elementPresent()`/`elementNotPresent()` and `visible()`/`hidden()`. If we're using directive like `ng-repeat` or `ng-if`, then we're completely creating/destroying DOM nodes if the directive finds a result.

On the other hand, with `ng-show` and `ng-hide` we are not destroying the DOM nodes, but simply hiding them. In this case you should be using `visible()`/`hidden()`.

For the completed filter we have 2 tests that are pretty similar to what we did for the active filter, but the opposite:

```javascript
'Completed filter only contains completed tasks': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/')
    .waitForElementVisible('#header h1', 1000)
    .setValue('#new-todo', 'My new task')
    .submitForm('#todo-form')
    .click('#todo-list li:first-child .toggle')
    .click('#filters li:nth-child(3) a')
    .assert.containsText('#todo-list li:first-child label', 'My new task')
    .end();
},

'Completed filter does not contain non-completed tasks': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/')
    .waitForElementVisible('#header h1', 1000)
    .setValue('#new-todo', 'My new task')
    .submitForm('#todo-form')
    .click('#filters li:nth-child(3) a')
    .assert.elementNotPresent('#todo-list li')
    .end();
}
```

However, rather than going directly to the page with the filter active, we start with the "All" filter. The reason for this is that, because when we have the completed filter active, new tasks will not be visible unless we complete them. So completing them can only be done using either the "All" or "Active" filter.

So you'll see that we have to do an extra step in these tests (compared to the previous 2 tests), namely clicking on the "Completed" filter (`.click('#filters li:nth-child(3) a')`).

### Testing the complete/uncomplete all feature

The next feature I'm going to test is the caret/arrow down icon within the textbox for adding new items. Clicking this little arrow completes/uncompletes all tasks. I'm going to create a new file for this one as well, called **completeAll.spec.e2e.js**.

Testing this feature is quite simple, if all the items are completed and you click it, then they all become uncompleted. Otherwise all items are completed.

There are three separate situations:

1. There is nothing completed: They should all become completed
2. There are some items completed, but not all: They should all become completed
3. All items are completed: They should all become uncompleted

So I wrote 3 tests to cover these situations:

```javascript
module.exports = {
  'Caret down completes all tasks if none selected': function(client) {
    client
      .url('http://todomvc.com/examples/angularjs/#/')
      .waitForElementVisible('#header h1', 1000)
      .setValue('#new-todo', 'My new task')
      .submitForm('#todo-form')
      .setValue('#new-todo', 'My other new task')
      .submitForm('#todo-form')
      .click('#toggle-all')
      .assert.containsText('#todo-count', '0 items left')
      .end();
  },

  'Caret down completes all tasks if some selected': function(client) {
    client
      .url('http://todomvc.com/examples/angularjs/#/')
      .waitForElementVisible('#header h1', 1000)
      .setValue('#new-todo', 'My new task')
      .submitForm('#todo-form')
      .setValue('#new-todo', 'My other new task')
      .submitForm('#todo-form')
      .click('#todo-list li:first-child .toggle')
      .click('#toggle-all')
      .assert.containsText('#todo-count', '0 items left')
      .end();
  },

  'Caret down uncompletes all tasks if all are selected': function(client) {
    client
      .url('http://todomvc.com/examples/angularjs/#/')
      .waitForElementVisible('#header h1', 1000)
      .setValue('#new-todo', 'My new task')
      .submitForm('#todo-form')
      .setValue('#new-todo', 'My other new task')
      .submitForm('#todo-form')
      .click('#todo-list li:first-child .toggle')
      .click('#todo-list li:nth-child(2) .toggle')
      .assert.containsText('#todo-count', '0 items left')
      .click('#toggle-all')
      .assert.containsText('#todo-count', '2 items left')
      .end();
  }
};
```

### Removing tasks

One of the two hardest features to test is the task removal feature. The issue here is that the cross to remove the task is only visible when you're hovering. Just like all previous test suites I'm going to create a separate file for them.

To test the remove feature I wrote the following test:

```javascript
module.exports = {
  'Remove single task': function(client) {
    client
      .url('http://todomvc.com/examples/angularjs/#/')
      .waitForElementVisible('#header h1', 1000)
      .setValue('#new-todo', 'My new task')
      .submitForm('#todo-form')
      .setValue('#new-todo', 'My other new task')
      .submitForm('#todo-form')
      .execute(function() {
        document.getElementById('todo-list').children[0].children[0].children[2].click();
      })
      .assert.containsText('#todo-count', '1 item left')
      .assert.containsText('#todo-list li:first-child', 'My other new task')
      .end();
  },

  // More tests
};
```

What happens here is that I add two tasks, and then I execute a script by using the `execute()` API. This script will fetch the remove button for the first child and click it.

For some reason the combination `moveTo()` and `click()` did not work, and by invoking the click through JavaScript, the element does not have to be visible.

Within the same test suite I'm also going to test the clear completed button which appears on the bottom right corner if your have some completed tasks. To do that, I'm going to write two tests:

1. Testing if the button does what it should do
2. Testing if the button only appears if there are completed tasks

I wrote the following two tests to verify this behaviour:

```javascript
'Clear all completed tasks': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/')
    .waitForElementVisible('#header h1', 1000)
    .setValue('#new-todo', 'My new task')
    .submitForm('#todo-form')
    .setValue('#new-todo', 'My other new task')
    .submitForm('#todo-form')
    .click('#todo-list li:nth-child(2) .toggle')
    .click('#clear-completed')
    .assert.containsText('#todo-count', '1 item left')
    .assert.containsText('#todo-list li:first-child', 'My new task')
    .end();
},

'Clear completed tasks is only visible if there are completed tasks': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/')
    .waitForElementVisible('#header h1', 1000)
    .setValue('#new-todo', 'My new task')
    .submitForm('#todo-form')
    .assert.hidden('#clear-completed')
    .click('#todo-list li:first-child .toggle')
    .assert.visible('#clear-completed')
    .end();
}
```

### Testing the edit functionality

The edit functionality was probably the hardest part to test, because the form automatically disappears if you unfocus the field. This made it very hard to use the normal `setValue()` API and in stead of that I had to use the `keys()` API.

The `dblClick()` API didn't work either, so to solve that I hade to manually send a double click event.

Anyways, I wrote two tests to cover the edit functionality, which I also placed in a new file called **editing.spec.e2e.js**.

The first test I wrote was to see if the textbox became visible when I double clicked:

```javascript
module.exports = {
  'Double clicking allows you to edit the task': function(client) {
    client
      .url('http://todomvc.com/examples/angularjs/#/')
      .waitForElementVisible('#header h1', 1000)
      .setValue('#new-todo', 'My new task')
      .submitForm('#todo-form')
      .doubleClick('#todo-list li:first-child label')
      .assert.visible('#todo-list li:first-child form')
      .end();
},
```

The next test was the hard part. The combination of `doubleClick()` and `setValue()` did not work, so to solve that I had to manually send an event, which you can do like this:

```javascript
var evt = document.createEvent('MouseEvents');
evt.initMouseEvent('dblclick',true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
document.getElementById('todo-list').children[0].children[0].children[1].dispatchEvent(evt);
```

Wrapping this in an `execute()` block did the trick... partly. Setting the value directly with `setValue()` still didn't work, so in stead of doing that I had to simply send some keypresses to the application. Obviously that also requires to send a Return key. To know how to do that you have to look at the [WebDriver specs](http://www.w3.org/TR/webdriver/#character-types) for special characters, where you can see that the Return key is `\uE006`.

Please note that the Enter key (`\uE007`) does not work for submitting that form!

Everything together you get:

```javascript
'Editing changed task description': function(client) {
  client
    .url('http://todomvc.com/examples/angularjs/#/')
    .waitForElementVisible('#header h1', 1000)
    .setValue('#new-todo', 'My new task')
    .submitForm('#todo-form')
    .execute(function() {
      var evt = document.createEvent('MouseEvents');
      evt.initMouseEvent('dblclick',true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      document.getElementById('todo-list').children[0].children[0].children[1].dispatchEvent(evt);
     })
    .keys(['My other new task', '\uE006'])
    .assert.containsText('#todo-list li:first-child', 'My other new task')
    .end();
}
```

### Testing it out

To test it out you open your terminal and enter the following command:

```
nightwatch --config tests/nightwatch.json --env chrome
```

This will run all tests, and will open Google Chrome several times (once for each test). Eventually you should see the result:

![nightwatch-run](./images/nightwatch-run.png)

If you want to run a test suite, you can use the following command:

```
nightwatch --config tests/nightwatch.json --env chrome --test tests/e2e/overview.spec.e2e.js
``` 

With the last command, only the tests within the overview spec will run.

### Conclusion

Nightwatch.js has a very clean API compared to most E2E frameworks. Chaining commands and assertions is very great, at least I find it a lot easier to read. But like with most E2E frameworks, it's hard to write, and hard to debug. Writing E2E tests for all features, how minor they may be, is not a good idea. Finding a good balance is the key to success with E2E testing, a very nice read is this article by the [Google devs and testers](http://googletesting.blogspot.be/2015/04/just-say-no-to-more-end-to-end-tests.html).

#### Achievement: Mastered Nightwatch.js

If you’re seeing this, then it means you successfully managed to make it through this article. If you’re interested in the full code example, you can find it on [GitHub](https://github.com/g00glen00b/angular-samples/tree/master/e2e-nightwatch).
