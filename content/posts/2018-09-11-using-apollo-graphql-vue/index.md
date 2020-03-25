---
title: "Using Apollo GraphQL with Vue"
date: "2018-09-11"
featuredImage: "../../images/logos/apollo.png"
categories: ["JavaScript", "Tutorials"]
tags: ["Apollo", "GraphQL", "JavaScript", "Vue"]
excerpt: "GraphQL is a new way to write your APIs, and with Apollo you can easily integrate it within your Vue.js applications. In this tutorial I'll show you how you can make queries and mutations within your Vue components."
---

[Last time](/getting-started-vue-at-ui/), I wrote a simple Vue application using dummy data in our components. Today, we're going to link it to the [Apollo GraphQL](https://www.apollographql.com/) API that I wrote earlier. As said before, Apollo has both a server-component that can integrate with Express, but also a client component that can integrate with Angular, React but also with Vue.

![Vue.js + Apollo + GraphQL](images/vue-apollo-graphql.png)

### Adding Apollo to our project

To add Apollo, you can either use the Apollo plugin for Vue CLI (if you're using v3.x), or you can install the following dependencies:

```
npm install --save vue-apollo graphql apollo-client apollo-link apollo-link-http apollo-cache-inmemory graphql-tag
```

After that, you can create a **src/apollo/index.js** file and add the following content:

```javascript
import {HttpLink} from 'apollo-link-http';
import {ApolloClient} from 'apollo-client';
import {InMemoryCache} from 'apollo-cache-inmemory';
import Vue from 'vue';
import VueApollo from 'vue-apollo';

Vue.use(VueApollo);

const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql',
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true
});

export default apolloClient;
```

This will export a "standard" Apollo client over HTTP, which we can now import in the **main.js** file so that we can use it throughout the application. To do this, you need to create a new provider:

```javascript
const apolloProvider = new VueApollo({
  defaultClient: apolloClient
});
```

To be able to do this, I also had to import both the `apolloClient` from the **src/apollo/index.js** location and `VueApollo`:

```javascript
import VueApollo from 'vue-apollo';
import apolloClient from './apollo';
```

And finally, you also have to add your provider to your `Vue` instance:

```javascript
new Vue({
  render: h => h(App),
  router,
  provide: apolloProvider.provide() // Add this
}).$mount('#app');
```

### Using queries

Now that we've setup our project, you can start writing queries. The first thing I want to do is to replace the dummy data from the `QuestionsPage` by an actual GraphQL query.

To do this, I'm going to create a separate file called **src/questions/queries.js** which will contain all the GraphQL queries related to questions. In this file, I'm going to start by exporting an `AllQuestions` query:

```javascript
import gql from 'graphql-tag';

export const AllQuestions = gql`
  query AllQuestions($query: Pagination!) {
    questionCount
    questions(query: $query) {
      _id
      title
      firstPost {
        _id
        voteCount
      }
    }
  }  
`;
```

The `gql` template literal tag library will parse the query for us, so that it can be used within our components. Before we actually start to use our query we need to remove the dummy data, and just replace it by an empty array:

```javascript
data () {
  return {
    questions: []
  };
}
```

After that, we can add the query to our component:

```javascript
import QuestionList from './QuestionList';
import {AllQuestions} from './queries';

export default {
  apollo: {
    questions: {
      query: AllQuestions,
      variables () {
        return {query: {offset: 0, limit: 10}}
      }
    },
  components: {QuestionList},
  data () {
    return {
      questions: []
    };
  }
}
```

The way Apollo works is that we define the proper type properties (in this case `questions`), and Apollo will automatically extract `questions` from the result and pass it to the component.

### Working with parameters

As you can see in the example above, we've hardcoded the `variables` section, but in most cases you probably want to customize this. To do this, let's create two new properties in our component called `offset` and `questionCount`:

```javascript
data () {
  return {
    offset: 0,
    questions: [],
    questionCount: 0
  };
}
```

The `questionCount` property will be provided by our backend, and will contain the amount of questions there are, so we can use some kind of pagination component. That means we need to add a new property to the `apollo` section:

```javascript
export default {
  apollo: {
    questions: {
      query: AllQuestions,
      variables () {
        return {query: {offset: this.offset, limit: 10}}
      }
    },
    questionCount: {
      query: AllQuestions,
      variables () {
        return {query: {offset: this.offset, limit: 10}}
      }
    }
  },
  // ...
}
```

As you can see, we're re-using the `AllQuestions` query for this new property. Apollo will notice that it's the same query, and it will be executed only once. I also replaced the hardcoded zero by `this.offset`, which means that Apollo will automatically update both `questions` and `questionCount` as soon as the offset changes.

The next step is to add a pagination component to the `QuestionsPage` component template:

```html
<at-pagination :total="questionCount" show-total v-on:page-change="updateOffset"></at-pagination>
```

In this case, I'm using the pagination component from AT UI, which requires us to send the `total` property, and has a `page-change` event that is triggered as soon as we change the page, and will contain the new page number.

Since we're using an offset (offset N elements) rather than a page number, I'll have to convert it within the `updateOffset` method:

```javascript
methods: {
  updateOffset (pageNumber) {
    this.offset = (pageNumber - 1) * 10;
  }
}
```

One thing you'll notice is that Apollo uses its own cache when fetching the same page. If you don't want to do this, you can change your `ApolloClient` in **src/apollo/index.js**:

```javascript
const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
  defaultOptions: {
    watchQuery: {fetchPolicy: 'network-only'},
    query: {fetchPolicy: 'network-only'}
  }
});
```

### Working with mutations

Being able to retrieve a list of questions using GraphQL is nice, but it would also be great if I could create new questions as well. To do this, I wrote a new component and created a `saveQuestion()` method that will do the actual saving:

```javascript
export default {
  components: {QuestionEditor},
  data () {
    return {title: '', content: ''};
  },
  methods: {
    saveQuestion (question) {
      // TODO
    }
  }
}
```

Writing mutations with Vue and Apollo is a bit different compared to querying. One similarity though is that we need to define our query first, for example:

```javascript
export const CreateQuestion = gql`
  mutation CreateQuestion($input: QuestionInput!) {
    createQuestion(input: $input) {
      _id
      title
    }
  }
`;
```

After that, we can use the query by using `this.$apollo` in our component, for example:

```javascript
saveQuestion (question) {
  const input = {...question};
  input.authorId = '5aeb5bd99be6ec471bcdff2f'; // Dummy author ID
  this.$apollo.mutate({
    mutation: CreateQuestion,
    variables: {input}
  }).then(() => this.$router.push({name: 'Questions'}));
}
```

Within the `mutate()` function we can provide both the mutation query and the variables we want to pass. In my case, I named the variable `$input` in my query, so I defined a variable called `input` in here as well.

This function returns a promise, which can be used to do something as soon as the request completes. In my case, I'm just redirecting it back to the question listing page because I have no better alternative... yet.

With that, we've seen the basics about using Apollo with Vue. As usual, you can find the code on [GitHub](https://github.com/g00glen00b/apollo-express-vue-example).
