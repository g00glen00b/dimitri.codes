---
title: "Routing with Vue"
featuredImage: "../../../images/logos/vue.png"
categories: ["Java", "Tutorials"]
tags: ["JavaScript", "Vue"]
excerpt: "An advantage of Vue is that many additional modules are officially developed, such as state management with vuex and routing with the vue-router. In this tutorial I'll take a look at the Vue router."
---

In the [previous tutorial](/getting-started-vue-and-ui/), I made a very [simple Vue application](https://github.com/g00glen00b/apollo-express-vue-example). However, the goal of the Q&A application that I'm trying to write is to have multiple pages within our application. To be able to get multiple pages to work client-side (Single-Page Applications), I need a router. The nice thing about Vue is that many of these modules, such as routing, are officially released, so you don't need any third-party library. In our case, we can use [vue-router](https://github.com/vuejs/vue-router) to make this work.

### Getting started

In the previous tutorial, we basically wrote our first page component, `QuestionPage`. The goal is to load this page, but using routes. The first step is to install the vue-router dependency:

```
npm install --save vue-router
```

After that, we can tell Vue to use the router module, by creating a file called **src/router/index.js** and to write the following code:

```javascript
import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
```

### Defining our routes

After we've setup the project, we can start defining the routes within the same file:

```javascript
export default new Router({
  routes: [{
    path: '/questions',
    name: 'Questions',
    component: QuestionsPage
  }]
});
```

This snippet of code will map the `QuestionsPage` component from the previous tutorial to the `/questions` route. We still need an outlet to where the page component will be displayed. Last time, we directly included the `QuestionsPage` component within the `App` component. While this did work, we now want to replace it by whatever the router is telling us to show.

To do this, we need to replace the `<QuestionsPage>` line with `<router-view/>`:

```html
<template>
  <div id="app">
    <div class="container">
      <SiteHeader></SiteHeader>
      <div class="inner-container">
        <router-view/>
      </div>
    </div>
  </div>
</template>
```

We can also remove the import of the `QuestionsPage` component.

All we have to do now is to import this router configuration into our application. To do so, we can open **src/main.js** and add the following to our `Vue` instance:

```javascript
new Vue({
  render: h => h(App),
  router
}).$mount('#app');
```

Don't forget to import it as well:

```javascript
import router from './router';
```

### Using push-state

If we open the application now, we'll see a blank page. However, if we go to [http://localhost:8080/#/questions](http://localhost:8080/#/questions), we see that the questions route is properly served and our questions become visible again.

What I don't like about this though, is that we use the hashtag within our route. Luckily for us, we can get rid of this by using push-state or history based routing. To change this, we have to open **src/router/index.js** again and add the `mode` property to the `Router` constructor:

```javascript
export default new Router({
  routes: [{
    path: '/questions',
    name: 'Questions',
    component: QuestionsPage
  }],
  mode: 'history' // Add this
});
```

After changing this, you can go to [http://localhost:8080/questions](http://localhost:8080/questions) to see the routes work again.

### Redirecting

Another thing I don't like yet is that we had to go to `http://localhost:8080/questions` by ourselves. Wouldn't it be nice if the root URL would automatically redirect us to `/questions`? Obviously, we could just change the route path to `/` and it would work, but I want to keep `/questions` and redirect to it.

To do this, we can add a new route and use the `redirect` property:

```javascript
export default new Router({
  routes: [{
    path: '/questions',
    name: 'Questions',
    component: QuestionsPage
  }, {
    path: '/',
    name: 'Home',
    redirect: {name: 'Questions'}
  }],
  mode: 'history'
});
```

Within the `redirect` property, we can either define a path (`redirect: '/questions`) or we can redirect by the name of the route by passing an object with the `name` property as we can see above.

If we visit the application by going to [http://localhost:8080](http://localhost:8080), we'll see that it gets properly directed to `/questions`, so that's working.

### Using wildcard routes

Another feature I want to add is that when you open an invalid path, you see an error page. With Vue, we can do this by adding a wildcard route:

```javascript
export default new Router({
  routes: [{
    path: '/questions',
    name: 'Questions',
    component: QuestionsPage
  }, {
    path: '/',
    name: 'Home',
    redirect: {name: 'Questions'}
  }, {
    path: '*',
    name: 'NotFound',
    component: NotFoundPage
  }],
  mode: 'history'
});
```

The wildcard `*` will match any path, so make sure that you put it at the bottom of your routes, since Vue will check for matching routes in the same order the array is defined. That means that if you put your wildcard route at the top, it will always match, even if you are trying to open the questions- or home-route.

Now that we defined the route, we can create a new Vue component called **src/core/NotFoundPage.vue** and add some markup, for example:

```html
<template>
  <div>
    <h1 class="page-title center">
      <i class="icon icon-activity"></i><br />
      Looks like you made a wrong turn,<br />
      the page you requested isn't available.
    </h1>
  </div>
</template>
```

### Add route links

Now that we have our routes, it's time to fix the `SiteHeader` component so that we can click those links and go to the proper route. Before we can actually do that, I'm going to define a dummy component for the users page called **src/compponents/users/UsersPage.vue**.

After that, I'm going to add a route called `/users`:

```javascript
export default new Router({
  routes: [{
    path: '/questions',
    name: 'Questions',
    component: QuestionsPage
  }, {
    path: '/users',
    name: 'Users',
    component: UsersPage
  }, {
    path: '/',
    name: 'Home',
    redirect: {name: 'Questions'}
  }, {
    path: '*',
    name: 'NotFound',
    component: NotFoundPage
  }],
  mode: 'history'
});
```

Now that we have our route, we can add route links by using `<router-link>`:

```html
<template>
  <at-menu mode="horizontal" active-name="questions">
    <at-menu-item name="questions">
      <router-link :to="{name:'Questions'}">
        <i class="icon icon-home"></i> Questions
      </router-link>
    </at-menu-item>
    <at-menu-item name="users">
      <router-link :to="{name: 'Users'}">
        <i class="icon icon-users"></i> Users
      </router-link>
    </at-menu-item>
  </at-menu>
</template>
```

We could also just use an anchor tag and use the `href` attribute to go to a specific route. However, this will cause the page to reload completely, and thus, the application will be reloaded as well. This can be a lot slower than just changing the page component.

If we would like to change the CSS class depending on the active route, we can use the `active-class` attribute. However, since AT UI has support for routes in their menu component, I'll be using that in stead. So remove the `<router-link>` elements, and put the `:to` attribute on the `<at-menu-item>`. Last but not least, you have to add the `router` attribute onto the `<at-menu>` element:

```html
<template>
  <at-menu mode="horizontal" router>
    <at-menu-item name="questions" :to="{name: 'Questions'}">
      <i class="icon icon-home"></i> Questions
    </at-menu-item>
    <at-menu-item name="users" :to="{name: 'Users'}">
      <i class="icon icon-users"></i> Users
    </at-menu-item>
  </at-menu>
</template>
```

If we take a look at the application now, we'll see that the active menu item is always correct, even after refreshing the page.

### Programmatically changing the route

Remember our not found page? Well, I would like to add a button to it so that we can easily go back to the overview of all questions. First of all, we need to define a method into our component that will change the router state. This can be done by using `this.$router.push()`:

```javascript
export default {
  methods: {
    openQuestions () {
      this.$router.push({name: 'Questions'});
    }
  }
}
```

The next step is to add the button to our template:

```html
<at-button size="large" type="primary" hollow="true" icon="icon-home" v-on:click="openQuestions">
  Go back to the question overview
</at-button>
```

If you change the URL to something that doesn't exist, you'll see a button now, and if you click on it, you get back to the questions overview:

![Example of the not found page](content/posts/2018/2018-08-28-routing-vue/images/workspaces_routing.png)

With that, it's time to end this tutorial. As usual, you can find the code at [GitHub](https://github.com/g00glen00b/apollo-express-vue-example).
