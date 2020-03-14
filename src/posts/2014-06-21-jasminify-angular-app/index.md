---
title: "Jasminify your Angular app"
date: "2014-06-21"
categories: ["JavaScript", "Tutorials"]
tags: ["AngularJS", "Jasmine", "JavaScript", "Testing"]
---

Two months ago I wrote a small [tutorial series](/introduction-angularjs/ "Introduction to AngularJS") about writing a small application using AngularJS. In that series I talked about the most common parts of AngularJS like controllers, services, filters and directives. However, AngularJS is more than just that, AngularJS also comes with an entire mocking framework, which makes the life of the unit tester a lot easier. In this tutorial I will demonstrate you the power of this mocking framework, by writing several Jasmine unit tests to test the behaviour of the application we wrote.

### Project setup

To make it easy I'm going to start of where I left previous time, so the best thing you can do is to download the [code example](https://github.com/song-rate-mvc/angular-song-rate/releases/tag/0.0.1) from the previous tutorial series to make sure we start with the same thing. If you downloaded the source code and installed all dependencies by using the command:

```
bower install
```

Then you can continue with the rest of this tutorial.

### Mocking dependencies

If you take a look at the controller we wrote (**controllers.js**), you will notice that two things are injected, $scope and songService. Obviously, when testing, we don't want that our back-end is actually called, the only thing we do want to know is, if the service has been called or not.

To do that, we're going to mock the service in stead of using it. Mocking it allows us to verify if it has been called and it also allows us to use mock data as response, which makes it easy to test if the right things happened to that response.

To allow injecting mocks, we're going to use the Angular mocks framework, so open up **bower.json** and add the **angular-mocks** dependency, for example:

```json
{
  "name": "angular-song-rate",
  "version": "0.0.1",
  "dependencies": {
    "angular": "latest",
    "bootstrap": "latest",
    "jquery": "latest",
    "lodash": "latest",
    "underscore.string": "latest",
    "font-awesome": "latest"
  },
  "devDependencies": {
    "angular-mocks": "latest"
  }
}
```

By adding the module to our `devDependencies`, we tell Bower that it's not necessary to run the application, but it is necessary when you're developing at it.

### Setting up your test suite

Now we're ready to start testing stuff, create a folder called **test** and add a file called **songCtrlSpec.js** inside that folder, this file will contain all our unit tests. When writing test cases, you first start by writing a test suite, for example:

```javascript
describe("Song rate controller", function() {
  // This will contain all our test cases
}
```

The next step (before really testing the application), is by preparing the controller and adding the mocks, by using the `beforeEach()` function. This function is called before each test case, so you're always sure you're working with a fresh controller, without any changes applied to it from previous tests. In this case I'm going to use the following code:

```javascript
var scope, service;
  
beforeEach(function() {
    
  // Create mock service
  service = jasmine.createSpyObj('songService', [ 'get', 'put' ]);
    
  // Mock Angular module
  angular.mock.module('myApp.controllers');
    
  // Create Song controller and inject mocks
  angular.mock.inject(function($rootScope, $controller) {
      
    service.get.andReturn([{
      id: 1,
      artist: "Artist",
      title: "Title",
      score: 0
    }]);
      
    scope = $rootScope.$new();
    $controller('songCtrl', {
      $scope: scope,
      songService: service
    });
  });
});
```

So, we add two variables called `scope` and `service`. The scope variable will contain a reference to the controller scope, while the service will contain a reference to the mocked songService which we injected into the controller.

The service itself in this case is a Jasmine spy, which means we can verify which functions have been called with which parameters. To create such a spy object, you use:

```javascript
service = jasmine.createSpyObj('songService', [ 'get', 'put' ]);
```

Then we can use `service.get.andReturn()` to make the mocked service return something.

### Testing the controller

So now we have created our controller, so it's time to test. The first thing I'm going to test is to see if the controller initially calls the service to load the latest songs. To do that, I wrote the following test case:

```javascript
it("retrieves songs on load", function() {
  expect(service.get).toHaveBeenCalled();
  expect(scope.songs.length).toEqual(1);
  expect(scope.songs[0].artist).toEqual("Artist");
  expect(scope.songs[0].title).toEqual("Title");
  expect(scope.songs[0].score).toEqual(0);
});
```

So, the first thing we do is to verify if `service.get()` has been called. The second thing we do is that we're going to verify if the model `songs` contains our mocked result data which we defined in the `beforeEach()` function.

Quite easy, don't you think? Now it's time to actually call methods on our controller and see if they behave as expected. When we call the `addSong()` function of the controller with a new artist/title, we expect that it is added to the `songs` model and is initialized with a score of 0. To do that, we first empty the `songs` array (not necessary, but makes it easier) and then add the song. All we have to do now is to verify if the songs model is updated or not:

```javascript
it('adds song to list', function() {
  scope.songs = [ ];
  scope.addSong('Artist 1', 'Title 1');
  expect(scope.songs.length).toEqual(1);
  expect(scope.songs[0].artist).toEqual("Artist 1");
  expect(scope.songs[0].title).toEqual("Title 1");
  expect(scope.songs[0].score).toEqual(0);
});
```

The next thing I want to show you is how we can verify if our service (songService) has been called or not when adding a new song, for example:

```javascript
it('stores data while adding', function() {
  scope.songs = [ ];
  // Manually $apply to trigger $watch
  scope.$apply();
  scope.addSong('Artist 1', 'Title 1');
  
  // Manually $apply to trigger $watch (and get differences)
  scope.$apply();
  expect(service.put).toHaveBeenCalledWith(scope.songs);
});
```

If you look at the code of our controller, you will notice that we used the `$scope.$watch()` mechanism to detect if there are changes and to store the data. When testing it out, you have to do some additional steps to trigger the `$scope.$watch()` mechanism. To trigger this function, we have to use the `$apply()` or `$digest()` function. In a real application this happens automagically (it's part of the magic behind AngularJS), but in our tests it doesn't.

The rest of the test is quite simple, we verify if the `service.put()` function has been called with our songs model as parameter.

The rest of the code is quite similar to test, eventually I ended up writing the following test suite to test my controller:

```javascript
describe("Song rate controller", function() {
  
  var scope, service;
  
  beforeEach(function() {
    
    // Create mock service
    service = jasmine.createSpyObj('songService', [ 'get', 'put' ]);
    
    // Mock Angular module
    angular.mock.module('myApp.controllers');
    
    // Create Song controller and inject mocks
    angular.mock.inject(function($rootScope, $controller) {
      
      service.get.andReturn([{
        id: 1,
        artist: "Artist",
        title: "Title",
        score: 0
      }]);
      
      scope = $rootScope.$new();
      $controller('songCtrl', {
        $scope: scope,
        songService: service
      });
    });
  });
  
  it("retrieves songs on load", function() {
    expect(service.get).toHaveBeenCalled();
    expect(scope.songs.length).toEqual(1);
    expect(scope.songs[0].artist).toEqual("Artist");
    expect(scope.songs[0].title).toEqual("Title");
    expect(scope.songs[0].score).toEqual(0);
  });
  
  it('adds song to list', function() {
    scope.songs = [ ];
    scope.addSong('Artist 1', 'Title 1');
    expect(scope.songs.length).toEqual(1);
    expect(scope.songs[0].artist).toEqual("Artist 1");
    expect(scope.songs[0].title).toEqual("Title 1");
    expect(scope.songs[0].score).toEqual(0);
  });
  
  it('adds multiple songs to list', function() {
    scope.songs = [ ];
    scope.addSong('Artist 1', 'Title 1');
    scope.addSong('Artist 2', 'Title 2');
    expect(scope.songs.length).toEqual(2);
    expect(scope.songs[0].artist).toEqual("Artist 1");
    expect(scope.songs[0].title).toEqual("Title 1");
    expect(scope.songs[0].score).toEqual(0);
    expect(scope.songs[1].artist).toEqual("Artist 2");
    expect(scope.songs[1].title).toEqual("Title 2");
    expect(scope.songs[1].score).toEqual(0);
  });
  
  it('stores data while adding', function() {
    scope.songs = [ ];
    // Manually $apply to trigger $watch
    scope.$apply();
    scope.addSong('Artist 1', 'Title 1');
    
    // Manually $apply to trigger $watch (and get differences)
    scope.$apply();
    expect(service.put).toHaveBeenCalledWith(scope.songs);
  });
  
  it('clears form model when adding song to list', function() {
    scope.newSong.artist = "Artist 1";
    scope.newSong.title = "Title 1";
    
    scope.addSong('Artist 1', 'Title 1');
    expect(scope.newSong.artist).toEqual("");
    expect(scope.newSong.title).toEqual("");
  });
  
  it('deletes song', function() {
    scope.deleteSong(scope.songs[0]);
    expect(scope.songs.length).toEqual(0);
  });
  
  it('deletes song in the middle', function() {
    scope.addSong('Artist 1', 'Title 1');
    scope.addSong('Artist 2', 'Title 2');
    expect(scope.songs.length).toEqual(3);
    scope.deleteSong(scope.songs[1]);
    expect(scope.songs.length).toEqual(2);
    
    expect(scope.songs[0].artist).toEqual('Artist');
    expect(scope.songs[0].title).toEqual('Title');
    expect(scope.songs[1].artist).toEqual('Artist 2');
    expect(scope.songs[1].title).toEqual('Title 2');
  });
  
  it('cannot delete a non-existing song', function() {
    scope.deleteSong({
      title: "Title",
      artist: "Another artist",
      score: 0
    });
    expect(scope.songs.length).toEqual(1);
  });
  
  it('stores data while deleting a song', function() {
    // Manually $apply to trigger $watch (and get differences)
    scope.$apply();
    scope.deleteSong(scope.songs[0]);
    
    // Manually $apply to trigger $watch (and get differences)
    scope.$apply();
    expect(service.put).toHaveBeenCalledWith(scope.songs);
  });
  
  it('verifies if String is empty or blank', function() {
    expect(scope.isEmpty("test")).toEqual(false);
    expect(scope.isEmpty("  test  ")).toEqual(false);
    expect(scope.isEmpty("  ")).toEqual(true);
    expect(scope.isEmpty("")).toEqual(true);
    expect(scope.isEmpty(null)).toEqual(true);
    expect(scope.isEmpty(undefined)).toEqual(true);
  });
});
```

### Testing a filter

The filter is probably the easiest to test, because it usually simply converts input to output. This means that our test cases only have to verify if the correct output has been produced for a specific piece of input. But before writing a test we have to get a reference to our filter, luckily for us there are no dependencies to mock here, so it's quite simple:

```javascript
describe('Titleize filter', function() {
  var filter;
  
  beforeEach(function() {
    angular.mock.module('myApp.filters');
    angular.mock.inject(function($filter) {
      filter = $filter('titleize');
    });
  });
});
```

Nothing really new here, just make sure you mock the right module and have a reference to the filter which we can use in our tests. As promised, the test case for the filter is quite easy as well:

```javascript
it('converts string to titleized string', function() {
  expect(filter("MY UPPERCASE STRING")).toEqual("My Uppercase String");
  expect(filter("my lowercase string")).toEqual("My Lowercase String");
  expect(filter("My MiXeD cAsE sTrInG")).toEqual("My Mixed Case String");
});
```

### Testing services

I think that by now you grabbed the concept of testing your code, so testing the service shouldn't be that hard either. For testing my songService which uses the HTML5 Local storage to store data, I'm mocking the `localStorage` API itself, for example:

```javascript
describe('Song storage service', function() {
  var scope, store;
  
  beforeEach(function() {
    store = [ ];
    // Mock localStorage
    spyOn(localStorage, 'getItem').andCallFake(function(key) {
      return store[key];
    });
    spyOn(localStorage, 'setItem').andCallFake(function(key, value) {
      store[key] = value;
    });
    
    angular.mock.module('myApp.services');
    angular.mock.inject(function($injector) {
      scope = $injector.get('songService');
    });
  });
});
```

In stead of just returning static data, we created a fake implementation using an array to store the data. This way we can provide a pretty accurate solution for mocking the local storage.

Testing it is easy as well:

```javascript
it('stores data in LocalStorage', function() {
  scope.put([{
    artist: "Artist",
    title: "Title"
  }]);
  
  var json = "[{\"artist\":\"Artist\",\"title\":\"Title\"}]";
  expect(localStorage.setItem).toHaveBeenCalledWith('myApp.songs', json);
});
```

So, when storing data we expect that the local storage has been used to store the JSON representation of that data.

We can also store some data inside the array and expect that it is being read by calling the service, for example:

```javascript
it('reads data in LocalStorage', function() {
  store\['myApp.songs'\] = "[{\"artist\":\"Artist\",\"title\":\"Title\"}]";
  var data = scope.get();
  expect(data.length).toEqual(1);
  expect(data[0].title).toEqual("Title");
  expect(data[0].artist).toEqual("Artist");
  expect(localStorage.getItem).toHaveBeenCalledWith('myApp.songs');
});
```

I also tested to see what happens if there's nothing stored yet when the service is reading the data, eventually ending up with the following test suite for my service:

```javascript
/*jslint node: true */
/*global angular, describe, it, jasmine, expect, beforeEach, spyOn */
"use strict";

describe('Song storage service', function() {
  var scope, store;
  
  beforeEach(function() {
    store = [ ];
    // Mock localStorage
    spyOn(localStorage, 'getItem').andCallFake(function(key) {
      return store[key];
    });
    spyOn(localStorage, 'setItem').andCallFake(function(key, value) {
      store[key] = value;
    });
    
    angular.mock.module('myApp.services');
    angular.mock.inject(function($injector) {
      scope = $injector.get('songService');
    });
  });
  
  it('stores data in LocalStorage', function() {
    scope.put([{
      artist: "Artist",
      title: "Title"
    }]);
    
    var json = "[{\"artist\":\"Artist\",\"title\":\"Title\"}]";
    expect(localStorage.setItem).toHaveBeenCalledWith('myApp.songs', json);
  });
  
  it('reads data in LocalStorage', function() {
    store['myApp.songs'] = "[{\"artist\":\"Artist\",\"title\":\"Title\"}]";
    var data = scope.get();
    expect(data.length).toEqual(1);
    expect(data[0].title).toEqual("Title");
    expect(data[0].artist).toEqual("Artist");
    expect(localStorage.getItem).toHaveBeenCalledWith('myApp.songs');
  });
  
  it('returns default empty array if no data is found in LocalStorage', function() {
    var data = scope.get();
    expect(data.length).toEqual(0);
  });
});
```

### And then finally... the directive

The most complex one is probably the directive. As you probably know by now, directives are everywhere in AngularJS and they actually make it possible for you to work with AngularJS without ever having the need of using HTML or DOM nodes directly in your JavaScript. However, the directive one of these parts that encapsulate working with the DOM, so while testing your directive can be interesting to test the interaction with the DOM as well.

Setting up the directive spec reflects this different approach as well:

```javascript
describe("Rating directive", function() {
  
  var scope, element, template = "<div rating score='score' max='max'></div>";
  
  beforeEach(module("app/templates/rating.html"));
  
  beforeEach(function() {
    angular.mock.module('myApp');
    angular.mock.inject(function($rootScope, $compile) {
      scope = $rootScope;
      element = angular.element(template);
      $compile(element)(scope);
    });
  });
});
```

You're no longer going to retrieve an instance by using the `$injector`, but now you're just going to compile a piece of HTML and retrieve the directive scope from it. Also, notice that, before actually creating a reference to the directive, we're also including the rating HTML template.

To test if something happens, we can test if the template is rendered well, for example, if the score is 2/5, it means 2 stars should be filled while 3 stars should be empty, as you can see in this test:

```javascript
it('renders full and empty stars', function() {
  scope.score = 2;
  scope.max = 5;
  scope.$digest();
  expect(element.find(".fa.fa-star-o").length).toEqual(3);
  expect(element.find(".fa.fa-star").length).toEqual(2);
  expect(element.find(".rating-highlight").length).toEqual(0);
  expect(element.find(".rating-normal").length).toEqual(5);
});
```

Also notice that, just like the controller, we have to `$digest()` or `$apply()` before we can see these changes applied to the DOM.

If you want to work with the isolated scope from the `link()` function, you can do that as well, just use `element.isolateScope()` to retrieve that scope:

```javascript
it('changes hovering index', function() {
  scope.score = 0;
  scope.max = 5;
  scope.$digest();
  var directive = element.isolateScope();
  directive.hover(3);
  scope.$digest();
  expect(directive.hoverIdx).toEqual(3);
  expect(element.find(".fa.fa-star-o").length).toEqual(1);
  expect(element.find(".fa.fa-star").length).toEqual(4);
  expect(element.find(".fa.fa-star:eq(3)").parents("a").hasClass("rating-highlight")).toEqual(true);
});
```

As you can see here we're using the `hover()` function to see if the class of the stars is updated to reflect that they're highlighted/hovered. When you're hovering over the fourth star (index 3), you expect that the first 4 stars are highlighted while the last one isn't.

In stead of calling functions to test the hover-mechanism, you can also trigger events, for example the `mouseover` event:

```javascript
it('changes hovering index by hovering star', function() {
  scope.score = 0;
  scope.max = 5;
  scope.$digest();
  var directive = element.isolateScope();
  element.find(".fa:eq(3)").trigger("mouseover");
  scope.$digest();
  expect(directive.hoverIdx).toEqual(3);
  expect(element.find(".fa.fa-star-o").length).toEqual(1);
  expect(element.find(".fa.fa-star").length).toEqual(4);
  expect(element.find(".fa.fa-star:eq(3)").parents("a").hasClass("rating-highlight")).toEqual(true);
});
```

The result is the same as the test before, but now we're actually testing if the events are working well too. Finally, I ended up with the following test suite for my directive:

```javascript
describe("Rating directive", function() {
  
  var scope, element, template = "<div rating score='score' max='max'></div>";
  
  beforeEach(module("app/templates/rating.html"));
  
  beforeEach(function() {
    angular.mock.module('myApp');
    angular.mock.inject(function($rootScope, $compile) {
      scope = $rootScope;
      element = angular.element(template);
      $compile(element)(scope);
    });
  });
  
  it('renders full and empty stars', function() {
    scope.score = 2;
    scope.max = 5;
    scope.$digest();
    expect(element.find(".fa.fa-star-o").length).toEqual(3);
    expect(element.find(".fa.fa-star").length).toEqual(2);
    expect(element.find(".rating-highlight").length).toEqual(0);
    expect(element.find(".rating-normal").length).toEqual(5);
  });
  
  it('changes hovering index', function() {
    scope.score = 0;
    scope.max = 5;
    scope.$digest();
    var directive = element.isolateScope();
    directive.hover(3);
    scope.$digest();
    expect(directive.hoverIdx).toEqual(3);
    expect(element.find(".fa.fa-star-o").length).toEqual(1);
    expect(element.find(".fa.fa-star").length).toEqual(4);
    expect(element.find(".fa.fa-star:eq(3)").parents("a").hasClass("rating-highlight")).toEqual(true);
  });
  
  it('changes hovering index by hovering star', function() {
    scope.score = 0;
    scope.max = 5;
    scope.$digest();
    var directive = element.isolateScope();
    element.find(".fa:eq(3)").trigger("mouseover");
    scope.$digest();
    expect(directive.hoverIdx).toEqual(3);
    expect(element.find(".fa.fa-star-o").length).toEqual(1);
    expect(element.find(".fa.fa-star").length).toEqual(4);
    expect(element.find(".fa.fa-star:eq(3)").parents("a").hasClass("rating-highlight")).toEqual(true);
  });
  
  it('shows the amount of stars based on the score if hover < score',function() {
    scope.score = 4;
    scope.max = 5;
    scope.$digest();
    var directive = element.isolateScope();
    directive.hover(1);
    directive.$digest();
    expect(element.find(".fa.fa-star").length).toEqual(4);
  });
  
  it('shows the amount of stars based on the hover if hover < score',function() {
    scope.score = 1;
    scope.max = 5;
    scope.$digest();
    var directive = element.isolateScope();
    directive.hover(3);
    directive.$digest();
    expect(element.find(".fa.fa-star").length).toEqual(4);
  });
  
  it('stops hovering', function() {
    scope.score = 0;
    scope.max = 5;
    scope.$digest();
    var directive = element.isolateScope();
    directive.hover(3);
    scope.$digest();
    expect(directive.hoverIdx).toEqual(3);
    directive.stopHover();
    scope.$digest();
    expect(directive.hoverIdx).toEqual(-1);
    expect(element.find(".rating-highlight").length).toEqual(0);
  });
  
  it('expects score to be updated', function() {
    scope.score = 0;
    scope.max = 5;
    scope.$digest();
    var directive = element.isolateScope();
    directive.setRating(2);
    scope.$digest();
    expect(scope.score).toEqual(3);
  });
  
  it('stops hovering when score is updated', function() {
    scope.score = 0;
    scope.max = 5;
    scope.$digest();
    var directive = element.isolateScope();
    directive.hover(3);
    scope.$digest();
    expect(element.find(".fa.fa-star:eq(3)").parents("a").hasClass("rating-highlight")).toEqual(true);
    
    directive.setRating(2);
    scope.$digest();
    expect(scope.score).toEqual(3);
    expect(element.find(".rating-highlight").length).toEqual(0);
  });
  
  it('expects score to be updated when clicked', function() {
    scope.score = 0;
    scope.max = 5;
    scope.$digest();
    var directive = element.isolateScope();
    directive.hover(3);
    scope.$digest();
    expect(element.find(".fa.fa-star:eq(3)").parents("a").hasClass("rating-highlight")).toEqual(true);
    
    element.find(".fa:eq(2)").parents("a").trigger("click");
    scope.$digest();
    expect(scope.score).toEqual(3);
    expect(element.find(".rating-highlight").length).toEqual(0);
  });
});
```

### And the fun continues...

So, these are the test cases I wrote, to see if they actually are being executed you can either use the Jasmine HTML runner, or you can choose a more complex runner, for example by using Grunt and Karma. Take a look at my [Making your AngularJS application grunt tutorial](/angular-grunt/ "Making your AngularJS application grunt") if you're interested in that kind of stuff as well. If you're not interested, no problem. However, for running the directive test you will probably have to precompile the rating.html template first.

#### Achievement: Worked with Jasmine and the AngularJS mock framework

Seeing this means you finished the Jasminify your Angular app tutorial. If you're interested in the full code example, you can find it on [GitHub](https://github.com/song-rate-mvc/angular-song-rate/tree/0.0.2). If you want to try out the code yourself, you can download an archive from [Github](https://github.com/song-rate-mvc/angular-song-rate/archive/0.0.2.zip).
