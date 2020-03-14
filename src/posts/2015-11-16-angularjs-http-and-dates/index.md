---
title: "AngularJS $http and dates"
date: "2015-11-16"
coverImage: "angularjs-logo.png"
categories: ["JavaScript", "Tutorials"]
tags: ["AngularJS", "JavaScript"]
---

When you're writing AngularJS applications, chances are that you're going to have to consume a REST API. If you're as lucky as me you'll encounter a situation where you'll have to read dates. However, while `Date` objects are a part of the standard [JavaScript specs](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date), it's not a part of the [JSON spec](http://www.json.org/). So... how do we handle dates?

### Date notations

There are three common practices to write dates. Let's look at them into detail first:

- Epoch time: This is the amount of seconds (or milliseconds) since January 1st 1970, at 00:00:00 UTC.
- ISO 8601 timestamp: This is an international standard for formatting dates/times. An example of such a timestamp is "2015-12-25T00:00:00Z", which means that it's the 25th of December 2015, at 00:00:00 UTC.
- Another kind of timestamp: While ISO 8601 should clearly being the favourite over other timestamp formats, it often happens that people return other kind of timestamps. An example is the MySQL timestamp format, for example `"2012-01-02 11:50:42"` (example used by [BreweryDB](http://www.brewerydb.com/developers/docs-endpoint/beer_index))

The first two options can be passed to a `Date` constructor in JavaScript, for example:

```javascript
new Date(1451001600000); // 25th of December 2015, 00:00:00 UTC
new Date("2015-12-25T00:00:00Z"); // 25th of December 2015 00:00:00 UTC
```

The other one requires some work, but can also be used to serialize and to deserialize dates.

However, the ISO 8601 has the benefit of being a lot more readable than the UNIX timestamp, and a more standard way of displaying timestamps as well. So this is the most recommended approach of passing dates.

### AngularJS `$httpProvider`

We now know we can easily convert these dates to ISO 8601 and vice versa. The question is, can we do this automatically?

If we look at the documentation of the [`$httpProvider`](https://docs.angularjs.org/api/ng/provider/$httpProvider), we see that it can be used to set the default behaviour of the `$http` service, which is actually the base component for all AJAX/REST traffic using AngularJS (including ngResource).

### Detecting ISO 8601 strings

So, if we transform the response data and are able to detect an ISO 8601, we could convert it. First of all, we need a way to detect these timestamps. The best way to do this is by using a regular expression.

Let's split an ISO 8601 timestamp into chunks. First of all we have the year. The year always contains 4 digits. Even if the year is below the year 1000, it is being prefixed with zeros. A pattern to describe 4 digits is `\d{4}`.

The month always contains 2 digits. However, we can even finetune this, because the first digit of the month is either a 0 or a 1 (there's no month starting with a 2). So we could write something like this: `[01]\d`. For the day of the month we can use a similar approach. The first digit always starts with a number from 0 to 3, so a pattern to describe that could be `[0-3]\d`.

For the time we use the same trick, the hours will become `[0-2]\d`, the minutes and the seconds will become `[0-5]\d`. The amount of milliseconds can be written as `\.\d+`, indicating that there should be one or more digits after the comma.

Finally we have the timezone indication, which can be either `+` or `-`, followed by the relative time to UTC or the `Z` letter, indicating that it is UTC. The pattern to describe this is `([+-][0-2]\d(:?[0-5]\d)?|Z)`. Both the following formats are valid timezones: `+04:00`, `+04` and `+0400`, so to handle these cases we had to include most parts optionally (0 or 1 occurences), which we can do with the `?` symbol.

Everything combined we get the following regular expression:

```javascript
/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d(:?[0-5]\d)?|Z)$/
```

Please note, this regular expression does not guarantee that you have a valid ISO 8601 timestamp, it only validates that the format is correctly. The timestamp `"2015-19-39T29:59:59.999+29:59"` does also match the regular expression, while it clearly isn't a valid date.

### Transform response

Now, to convert all ISO 8601 timestamps to dates, we have to configure `$httpProvider`, we can do this by writing:

```javascript
function config($httpProvider) {
  // This will contain our code
}

config.$inject = ['$httpProvider'];

angular
  .module('myApp')
  .config(config);
```

Now, for the code itself, we're going to write a function that will recurse through the entire object structure, looking for any string that matches the regular expression we just made.

The code for this function is:

```javascript
var dateRegex = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d(:?[0-5]\d)?|Z)$/;
function recurseObject(object) {
  var result = object;
  if (object != null) {
    result = angular.copy(object);
    for (var key in result) {
      var property = result[key];
      if (typeof property === 'object') {
        result[key] = recurseObject(property);
      } else if (typeof property === 'string' && dateRegex.test(property)) {
        result[key] = new Date(property);
      }
    }
  }
  return result;
}
```

What happens here is that we first check if `object` is not `null` or `undefined`. Then we make a deep copy of it using [`angular.copy()`](https://docs.angularjs.org/api/ng/function/angular.copy). This is probably not the best approach performance wise (because this function will be called recursively and will keep deep copying its content), but I'm never going to send a lot of data, and I rather play safe.

Anyways, for every key in the copied object we're retrieving the value. If the value is another object, then we have to recurse over that object. If the value is a string, then we test the string with our regular expression and if it matches we overwrite the value with the new date object.

This coverts all cases normally (unless I missed something). The next phase is to add it to the `$httpProvider`:

```javascript
$httpProvider.defaults.transformResponse = function(data) {
  try {
    var object;
    if (typeof data === 'object') {
      object = data;
    } else {
      object = JSON.parse(data);
    }
    return recurseObject(object);
  } catch(e) {
    return data;
  }
};
```

What happens here is that if the data is still a string we try to parse the JSON to retrieve the object. The object is then passed to our recursive function, which will convert all dates. In case if the data is not an object, but does not contain valid JSON either, we simply catch the exception and return the plain data itself.

### Testing it out

To test it out, I'm going to write a small application using the [Marvel API](http://developer.marvel.com/).

First of all you'll have to write a service, for example:

```javascript
(function(angular) {
  'use strict';
  
  function Marvel($resource) {
    return $resource('http://gateway.marvel.com/v1/public', {}, {
      getCharacters: {
        method: 'GET',
        isArray: false,
        url: 'http://gateway.marvel.com/v1/public/characters'
      }
    });
  }

  Marvel.$inject = ['$resource'];

  angular
    .module('testApp')
    .factory('Marvel', Marvel);
}(angular));
```

Both `$resource` and `$http` should work here. After writing the service you can inject it in a controller and use:

```javascript
vm.characters = Marvel.getCharacters({
  apikey: '/** Enter your public API key here */'
});
```

This should do the trick, if you loop over them, you'll see that the `character.modified` date is no longer a simple string, but a date. Which means we can use the [date](https://docs.angularjs.org/api/ng/filter/date) filter on it to format it to any string we'd like.

For example:

```html
<table class="table table-condensed table-striped">
  <thead>
    <tr>
      <th>Character name</th>
      <th>Last modified</th>
    </tr>
  </thead>
  <tbody>
    <tr ng-repeat="character in vm.characters.data.results">
      <td>{{character.name}}</td>
      <td>{{character.modified | date:'dd/MM/yyyy'}}</td>
    </tr>
  </tbody>
</table>
```

If you have an extension like [ng-inspector](https://chrome.google.com/webstore/detail/ng-inspector-for-angularj/aadgmnobpdmgmigaicncghmmoeflnamj?hl=en) or [Batarang](https://chrome.google.com/webstore/detail/angularjs-batarang/ighdmehidhipcmcojjgiloacoafjmpfk?hl=en), you'll see that the `modified` property is not a string, but an object.

![date-object](images/date-object1.png)

#### Achievement: Master of `$http`

If you’re seeing this, then it means you successfully managed to make it through this article. If you’re interested in the full code example, you can find it on [GitHub](https://github.com/g00glen00b/angular-samples/tree/master/http-config-usage).
