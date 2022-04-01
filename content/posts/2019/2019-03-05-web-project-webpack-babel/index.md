---
title: "Starting a web project with Webpack and Babel"
featuredImage: "../../../images/logos/webpack.png"
categories: ["JavaScript", "Tutorials"]
tags: ["NPM"]
excerpt: "Building JavaScript applications has evolved over time, and in this tutorial we'll explore how Babel and Webpack can be used to make your life easier."
---

When starting a new web project, you often use some libraries. Nowadays, these libraries usually come with tools to scaffold your project. However, in certain cases you don't want to rely on these libraries. For that reason, we'll demonstrate how you can set up your own project with [Webpack](https://webpack.js.org/) and [Babel](https://babeljs.io/).

![Babel + Webpack](content/posts/2019/2019-03-05-web-project-webpack-babel/images/babel-webpack.png)

### Getting started

Before starting, you have to install a recent version of [Node.js and npm](https://nodejs.org/en/). Once that's done, you can initialize your project using the **npm init** command. This command will help you setting up a **package.json**, which could look like this:

```json
{
  "name": "movie-quote-consumer",
  "version": "0.0.1",
  "author": {
    "name": "g00glen00b"
  },
  "private": true,
  "scripts": {
  },
}
```

### Setting up Babel

The next step is to set up Babel. Babel is a **transpiler**, which means it translates code from language A to language B. For Babel, this is a translation between JavaScript and JavaScript.

You might think, why should I do that? Well, each browser and JavaScript platform has a different support for certain features. Using Babel, we can transpile the JavaScript code so that it works on certain browsers. This allows developers to use the most recent language features, while keeping support for all targeted platforms.

To set up Babel, I'm going to add a few development dependencies, such as:

- **@babel/core**: This dependency is the core library, and is required when using Babel.
- **@babel/cli**: As the name suggests, this dependency allows us to use a command prompt/terminal/npm scripts to transpile resources using Babel.
- **@babel/register**: This library will do the heavy lifting for you, and will automatically transpile all resources that use Node.js `require()`.
- **@babel/preset-env**: Next to all these "core" dependencies, you also have to define which environment you want to compile to. Using this dependency, you can easily target certain environments.

```
npm install --save-dev @babel/cli @babel/core @babel/preset-env @babel/register
```

After installing these dependencies, the next step is to configure Babel to use the **@babel/preset-env** preset. To do so, we create a file called **.babelrc**:

```json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": "> 0.25%, not dead"
    }]
  ]
}
```

This configuration makes sure that the transpiled code works on all browsers that are:

- Still supported, and thus not dead or abandoned.
- Have a market share of more than **0,25%**.

You can also target specific browsers, such as:

```json
{
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "chrome": "80"
      }
    }]
  ]
}
```

Rather than configuring these targets within **.babelrc**, you can also choose to configure them within **package.json** or within a **.browserlistrc** file. Personally, I prefer having all Babel-related configuration at one place.

## Setting up Webpack

While Babel does the transpiling for you, there are still some other things you need to do. For example, you have to build everything, set up linting, ... . Tools like Webpack can make this a lot easier.

To be able to use Webpack, we need to add some other dependencies first, such as:

- **webpack**: This is the core Webpack dependency
- **webpack-cli**: This dependency allows you to run Webpack from your commandline, terminal, or use it within npm scripts.
- **webpack-dev-server**: This dependency will set up a local web server for development purposes. This means that you don't have to install and configure your own web server like Apache or nginx. Additionally, this will automatically refresh the page when you change your code.

Additionally, we have to install a few loaders and plugins, that will be used for bundling the application:

- **babel-loader**: This will allow us to transpile the code using Babel, and then bundle it
- **css-loader**: The CSS loader will be able to load CSS files, and imported CSS files. This allows you to add your styling to your bundle.
- **style-loader**: This loader is usually used in combination with the css-loader, and will bundle the CSS by adding a script that injects a `<style>` tag.
- **html-webpack-plugin**: This plugin will allow you to automatically add a `<script>` tag containing your bundle to your index page.

```
npm install --save-dev webpack webpack-cli webpack-dev-server babel-loader css-loader style-loader html-webpack-plugin
```

### Configuring Webpack

The next step is to configure how Webpack should use these loaders and plugins. The way to do this is by creating a file called **webpack.config.js**.

First of all, I had to tell Webpack which my entry points are, and where the bundle should be located. These entry points are basically a list of your main files that import all the other ones.

```javascript
const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
require('@babel/register');

module.exports = env => {
  return {
    entry: ['./src/index.js', './src/style.css'],
    output: {
      path: path.resolve(__dirname, 'dist/'),
      filename: 'bundle.js'
    },
    devtool: 'source-map'
    // ...
  };
};
```

In this case, both **src/index.js** and **src/style.css** are my entrypoints. Thus, all files that are imported from there on, will also be bundled. The location of the bundle is a file called **bundle.js**, which we'll store in a folder called **/dist.** Next to my bundle, I'll also generate a source map file that I can use for development.

The next step is to tell Webpack which loaders to use to bundle your source code. As mentioned earlier, I will be using the **babel-loader**, **css-loader** and **style-loader**:

```javascript
const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
require('@babel/register');

module.exports = env => {
  return {
    // entry + output + devtool ...
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }, {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader']
      }]
    },
    // ...
  };
};
```

Additionally, I also want to add my **src/index.html** page to the destination, and add a `<script>` tag to it containing the **bundle.js**, and a hash that will make sure browsers are not using an old cached version:

```javascript
const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
require('@babel/register');

module.exports = env => {
  return {
    // entry + output + devtool + module ...
    plugins: [
      new htmlWebpackPlugin({
        template: 'src/index.html',
        filename: 'index.html',
        hash: true
      })
    ]
  };
};
```

Finally, I also want to define an environment variable called `API_URL` that will contain a reference to my backend, so that I can customise this when building for a different environment:

```javascript
const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
require('@babel/register');

module.exports = env => {
  return {
    // entry + output + devtool + module ...
    plugins: [
      new htmlWebpackPlugin({
        template: 'src/index.html',
        filename: 'index.html',
        hash: true
      }),
      new webpack.DefinePlugin({
        'API_URL': JSON.stringify(env.API_URL)
      })
    ]
  };
};

```

With that, we're able to set up our initial project and bundle our HTML, CSS and JS files together into the **dist/** folder.

### Running webpack

Even though we completely configured webpack for now, we still would have to execute the webpack command ourselves, and pass the `API_URL` environment variable.

To make our lifes easier, we can use **npm scripts** to actually do this for us. This also allows us to call the Webpack CLI without having to install it globally. Installing it globally could be troublesome in case you want to use multiple versions.

To add a script, you can open the **package.json** file and add something like this:

```json
{
  "name": "movie-quote-consumer",
  "version": "0.0.1",
  "scripts": {
    "start": "webpack-dev-server --open --mode development --port 8081 --env.API_URL=http://localhost:8080/api",
    "build": "webpack --mode production --env.API_URL=./movie-quote-service/api"
  },
  "devDependencies": {
    "@babel/cli": "^7.2.3",
    "@babel/core": "^7.2.2",
    "@babel/preset-env": "^7.3.1",
    "@babel/register": "^7.0.0",
    "babel-loader": "^8.0.5",
    "css-loader": "^2.1.0",
    "html-webpack-plugin": "^3.2.0",
    "style-loader": "^0.23.1",
    "webpack": "^4.29.0",
    "webpack-cli": "^3.2.1",
    "webpack-dev-server": "^3.1.14"
  }
}

```

These scripts will do two things. First of all, when running **npm start** or **npm run start**, it will use the **webpack-dev-server** dependency to serve your application on port 8081. Additionally, it will configure the **API\_URL** environment variable.

The other script, which can be launched with **npm run build**, will generate production-ready code, and will configure the **API\_URL** to a different value. In this case, I'll use a reverse proxy and configure the backend on the same port, so I can use a relative path.

With this, we're properly able to run our application with Webpack and Babel.
