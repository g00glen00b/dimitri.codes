---
title: "Using WebSockets with Spring, AngularJS and SockJS"
date: "2014-10-05"
featuredImage: "../../images/logos/angularjs.png"
categories: ["Java", "Tutorials"]
tags: ["AngularJS", "Spring", "Spring MVC", "WebSockets"]
---

A while ago I wrote a tutorial about writing a web application using Spring, AngularJS and WebSockets. However, that tutorial only used a fraction of what WebSockets could do, so in this tutorial I will explain how you can write a small chat app using the same frameworks; Spring, AngularJS, Stomp.js and SockJS. The entire application will be written using JavaConfig, even the web.xml (what I still kept in my previous tutorial) will be replaced by a `WebAppInitializer`.

The application we're going to write will look like this:

![app-example](images/app-example.png)

### Why WebSockets

Once upon a time, someone decided to write a mail list application. At first, he made a client that would check if there was a new mail every minute. However, most of the time there was no new mail, yet the client was always sending new request, causing a huge load on the server. This technique was quite popular, and was called **polling**. Then after a while, they used a new technique, where the client would check if there was new mail, and the server would respond as soon as there was mail available. This technique was a bit better than polling, but you still had to send a request, causing a lot of unnecessary (blocking) traffic, we called this technique **long polling**.

When you start thinking, the only conclusion you can make is that the server should send a message to the client as soon as there is mail available. The client should not initiate the request, but the server should do that. This was impossible for a long time, but since WebSockets where introduced, it finally became possible.

**WebSockets** is a protocol and a JavaScript API, the protocol is a very low level, full-duplex protocol, which means that messages can be sent in both directions simultaneous. It made it possible for the server to send data to the client, in stead of doing the opposite. Polling and long-polling were no longer necessary, and they lived happily ever after.

Because WebSockets provide a way to communicate in both ways, they're often used for realtime applications. If for example, someone opened your application and modifies some data, you can directly update the visualized data for all users by using WebSockets.

### Project setup

You will need several libraries here, mainly the Spring Web MVC framework for setting up our web application and Spring messaging + WebSockets for the WebSocket part of the application. We also need a JSON serializer like Jackson, because Stomp needs JSON serialization/deserialization, so I'm going to add those to our application as well.

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>4.1.1.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-websocket</artifactId>
    <version>4.1.1.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-messaging</artifactId>
    <version>4.1.1.RELEASE</version>
</dependency>
<dependency>
    <groupId>javax.websocket</groupId>
    <artifactId>javax.websocket-api</artifactId>
    <version>1.0</version>
    <scope>provided</scope>
</dependency>
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>javax.servlet-api</artifactId>
    <version>3.1.0</version>
    <scope>provided</scope>
</dependency>
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>jstl</artifactId>
    <version>1.2</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-core</artifactId>
    <version>2.3.3</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.3.3</version>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.jaxrs</groupId>
    <artifactId>jackson-jaxrs-json-provider</artifactId>
    <version>2.3.3</version>
</dependency>
```

In the front-end I'm going to need some libraries as well, which I will setup using Bower. If you're not into Bower, you can always download the libraries by yourself.

```json
{
  "name": "spring-ng-chat",
  "version": "0.0.1-SNAPSHOT",
  "dependencies": {
    "sockjs": "0.3.4",
    "stomp-websocket": "2.3.4",
    "angular": "1.3.8",
    "lodash": "2.4.1"
  }
}
```

The libraries I'm going to use are SockJS + Stomp.js for communication through WebSockets, AngularJS will be used for setting up the client-part of the application and Lo-Dash is a utility library that I will use (a fork of Underscore.js).

**What is STOMP?** Like I said before, the WebSocket protocol is a pretty low-level protocol, however, there are a few high(er) level protocols that can be used on top of WebSockets, for example MQTT and STOMP. STOMP for example adds extra possibilities to WebSockets, like publishing and subscribing to topics.

### Java config

In stead of configuring our application using XML's, I'm going to show you how you could write the same application, without the need of any XML file. The first class we need is the replacement of our web.xml, to bootstrap our web application. In this class we can define our application context(s), our web application context and some other servlet related configuration.

```java
public class WebAppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

  @Override
  protected void customizeRegistration(ServletRegistration.Dynamic registration) {
    registration.setInitParameter("dispatchOptionsRequest", "true");
    registration.setAsyncSupported(true);
  }

  @Override
  protected Class< ?>[] getRootConfigClasses() {
    return new Class< ?>[] { AppConfig.class, WebSocketConfig.class };
  }

  @Override
  protected Class< ?>[] getServletConfigClasses() {
    return new Class< ?>[] { WebConfig.class };
  }

  @Override
  protected String[] getServletMappings() {
    return new String[] { "/" };
  }

  @Override
  protected Filter[] getServletFilters() {
    CharacterEncodingFilter characterEncodingFilter = new CharacterEncodingFilter();
    characterEncodingFilter.setEncoding(StandardCharsets.UTF_8.name());
    return new Filter[] { characterEncodingFilter };
  }
}
```

Most of this class is quite clear. First of all we have our `getRootConfigClasses()` and `getServletConfigClasses()` which we use to define our bean configuration classes. The `getServletMappings()` and `getServletFilters()` are related to servlet configuration. In this case I'm mapping the application to the context root and I'm adding a filter to make sure all content is in UTF-8.

Then the final method here is the `customizeRegistrion`. This can be quite important if you're running the application on a Tomcat container. It says that asynchronous communication is possible, so that connections do not have to be closed directly.

As you might notice, you will get three compilation errors of classes that are not found. I'm going to define those now, so let's start with `AppConfig`:

```java
@Configuration
@ComponentScan(basePackages = "be.g00glen00b", excludeFilters = {
    @ComponentScan.Filter(value = Controller.class, type = FilterType.ANNOTATION),
    @ComponentScan.Filter(value = Configuration.class, type = FilterType.ANNOTATION)
})
public class AppConfig {

}
```

Quite empty and useless here, it tells which packages to scan, but excludes all configuration and controller classes (configuration classes are bootstrapped by our WebAppInitializer while Controller classes are bound to our `WebConfig`). Since we will only need a controller, this class will do nothing special, but if you have special services, then they will become spring beans if annoted correctly.

The next class is the `WebConfig`:

```java
@Configuration
@EnableWebMvc
@ComponentScan(basePackages = "be.g00glen00b.controller")
public class WebConfig extends WebMvcConfigurerAdapter {

  @Bean
  public InternalResourceViewResolver getInternalResourceViewResolver() {
    InternalResourceViewResolver resolver = new InternalResourceViewResolver();
    resolver.setPrefix("/WEB-INF/views/");
    resolver.setSuffix(".jsp");
    return resolver;
  }

  @Override
  public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
    configurer.enable();
  }

  @Bean
  public WebContentInterceptor webContentInterceptor() {
    WebContentInterceptor interceptor = new WebContentInterceptor();
    interceptor.setCacheSeconds(0);
    interceptor.setUseExpiresHeader(true);
    interceptor.setUseCacheControlHeader(true);
    interceptor.setUseCacheControlNoStore(true);

    return interceptor;
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/libs/**").addResourceLocations("/libs/");
    registry.addResourceHandler("/app/**").addResourceLocations("/app/");
    registry.addResourceHandler("/assets/**").addResourceLocations("/assets/");
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(webContentInterceptor());
  }
}
```

This configuration class bootstraps our web context. It tells us which static resources can be served (with `addResourceHandlers`. It adds a no cache interceptor (`webContentInterceptor()` and `addInterceptors()`) and also tells us the location of our dynamic resources (JSP files) by using the `getInternalResourceViewResolver()` bean.

Then finally we also have the WebSocket configuration:

```java
@Configuration
@EnableWebSocketMessageBroker
@ComponentScan(basePackages = "be.g00glen00b.controller")
public class WebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer {

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic");
    config.setApplicationDestinationPrefixes("/app");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/chat").withSockJS();
  }
}
```

Just like the `WebConfig` it has to scan components in the controller package as well, because we will map our WebSocket traffic onto our controllers. Then we have to configure the message broker (where communication enters and leaves) using `configureMessageBroker` and we also have to configure our endpoints using `registerStompEndpoints`.

WebSockets are not yet working in all browsers. Many WebSockets libraries (for example SockJS and Socket.io) provide fallback-options using long polling, polling, ... . Spring also allows these fallbacks, and is compatible with **SockJS**. This is why choosing SockJS as the client is a good idea.

### Data transfer object

Our main communication will happen through WebSockets. To communicate, we will send a certain payload and respond to a specific Stomp.js topic. We need two classes for it, `Message` and `OutputMessage`.

First of all, `Message` will contain the chat message itself, and a generated ID, for example:

```java
public class Message {

  private String message;
  private int id;
  
  public Message() {
    
  }
  
  public Message(int id, String message) {
    this.id = id;
    this.message = message;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public int getId() {
    return id;
  }

  public void setId(int id) {
    this.id = id;
  }
}
```

The `OutputMessage` will extend `Message`, but will also add a timestamp (the current date) to it:

```java
public class OutputMessage extends Message {

    private Date time;
    
    public OutputMessage(Message original, Date time) {
        super(original.getId(), original.getMessage());
        this.time = time;
    }
    
    public Date getTime() {
        return time;
    }
    
    public void setTime(Date time) {
        this.time = time;
    }
}
```

### Spring controller

The final step in the Java-part of our application is the controller itself, with two mappings; one for the HTML/JSP page that contains our application, and the other for the WebSocket traffic:

```java
@Controller
@RequestMapping("/")
public class ChatController {

  @RequestMapping(method = RequestMethod.GET)
  public String viewApplication() {
    return "index";
  }
    
  @MessageMapping("/chat")
  @SendTo("/topic/message")
  public OutputMessage sendMessage(Message message) {
    return new OutputMessage(message, new Date());
  }
}
```

What happens here is quite easy, when we go to the context root, we will see that `viewApplication()` is mapped onto that, so that the index.jsp page is used as the view. The other method, `sendMessage()` allows us to broadcast a message to `/topic/message` when a message entes the messagebroker `/app/chat` (don't forget that we defined the prefix `/app` in `WebSocketConfig`).

### The view

Now our entire Java code is already written, let's start by defining the JSP page. This page will contain two main components; the form to add a new message, and the message list itself.

```html
<!DOCTYPE HTML>
<html lang="en">
  <head>
    <link href="http://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700" rel="stylesheet" type="text/css" />
    <link href="assets/style.css" rel="stylesheet" type="text/css" />
  </head>
  <body ng-app="chatApp">
    <div ng-controller="ChatCtrl" class="container">
      <form ng-submit="addMessage()" name="messageForm">
        <input type="text" placeholder="Compose a new message..." ng-model="message" />
        <div class="info">
          <span class="count" ng-bind="max - message.length" ng-class="{danger: message.length > max}">140</span>
          <button ng-disabled="message.length > max || message.length === 0">Send</button>
        </div>
      </form>
      <hr />
      <p ng-repeat="message in messages | orderBy:'time':true" class="message">
        <time>{{message.time | date:'HH:mm'}}</time>
        <span ng-class="{self: message.self}">{{message.message}}</span>
      </p>
    </div>
    
    <script src="libs/sockjs/sockjs.min.js" type="text/javascript"></script>
    <script src="libs/stomp-websocket/lib/stomp.min.js" type="text/javascript"></script>
    <script src="libs/angular/angular.min.js"></script>
    <script src="libs/lodash/dist/lodash.min.js"></script>
    <script src="app/app.js" type="text/javascript"></script>
    <script src="app/controllers.js" type="text/javascript"></script>
    <script src="app/services.js" type="text/javascript"></script>
  </body>
</html>
```

First of all we're adding the Open Sans font and our own stylesheet (which we will define later in this tutorial). Then we start the body and bootstrap our AngularJS application which we will call `chatApp`. In this application we will have one AngularJS controller, the `ChatCtrl`. Don't confuse this one with our Spring controller!

The first thing we have to do is create form that has a text field. We're binding this text-field to the model called `message`. When the form is submit, the `addMessage()` function on our controller will be called, which we will use to send the message using websockets.

To make the form a bit fancier, we also added a counter similar to how Twitter works. The moment you enter too many characters (`max`), it will turn red and you can no longer submit the form thanks to the `ng-disabled` directive.

Below the form we loop through the messages and for each message we print the time and the message. If the message originated from the user self, it will have a specific `self` class, thanks to the `ng-class` directive. The messages are sorted by their date, with the most recent one at the top of the list.

At the end of our page we load all the libraries we need, and our application JavaScript files.

### Bootstrapping the AngularJS application

Our first JavaScript file is **app.js**. This file will define all module packages, in this case:

```javascript
angular.module("chatApp", [
  "chatApp.controllers",
  "chatApp.services"
]);

angular.module("chatApp.controllers", []);
angular.module("chatApp.services", []);
```

### AngularJS controller

The AngularJS controller will be quite easy as well, as it will forward everything to a seperate service we will write later in this tutorial. The controller contains three model related fields, the `message` which will contain the currently typed message in the textbox, the `messages` array which contains all received messages and also `max` the maximum allowed characters in a message, used for the Twitter-look-a-like counter.

```javascript
angular.module("chatApp.controllers").controller("ChatCtrl", function($scope, ChatService) {
  $scope.messages = [];
  $scope.message = "";
  $scope.max = 140;

  $scope.addMessage = function() {
    ChatService.send($scope.message);
    $scope.message = "";
  };

  ChatService.receive().then(null, null, function(message) {
    $scope.messages.push(message);
  });
});
```

We already explained that when the form is submit, the `addMessage` is called, which will forward the message to the service, and which will then empty the field by resetting the message model to an empty string. We also call the service for receiving messages. This part of the service will return a deferred, that each time a message is received, updates the progress part of the directive. The controller will react on that message by adding it to the `messages` array.

### AngularJS service

The last part of our AngularJS based client application is the service. The service is a bit more complex, since it will contain all WebSocket traffic handling code. The code of this service is as follows:

```javascript
angular.module("chatApp.services").service("ChatService", function($q, $timeout) {
    
    var service = {}, listener = $q.defer(), socket = {
      client: null,
      stomp: null
    }, messageIds = [];
    
    service.RECONNECT_TIMEOUT = 30000;
    service.SOCKET_URL = "/spring-ng-chat/chat";
    service.CHAT_TOPIC = "/topic/message";
    service.CHAT_BROKER = "/app/chat";
    
    service.receive = function() {
      return listener.promise;
    };
    
    service.send = function(message) {
      var id = Math.floor(Math.random() * 1000000);
      socket.stomp.send(service.CHAT_BROKER, {
        priority: 9
      }, JSON.stringify({
        message: message,
        id: id
      }));
      messageIds.push(id);
    };
    
    var reconnect = function() {
      $timeout(function() {
        initialize();
      }, this.RECONNECT_TIMEOUT);
    };
    
    var getMessage = function(data) {
      var message = JSON.parse(data), out = {};
      out.message = message.message;
      out.time = new Date(message.time);
      if (_.contains(messageIds, message.id)) {
        out.self = true;
        messageIds = _.remove(messageIds, message.id);
      }
      return out;
    };
    
    var startListener = function() {
      socket.stomp.subscribe(service.CHAT_TOPIC, function(data) {
        listener.notify(getMessage(data.body));
      });
    };
    
    var initialize = function() {
      socket.client = new SockJS(service.SOCKET_URL);
      socket.stomp = Stomp.over(socket.client);
      socket.stomp.connect({}, startListener);
      socket.stomp.onclose = reconnect;
    };
    
    initialize();
    return service;
});
```

So, let's first start with the bottom. At the bottom of the code you can see that we execute the `initialize()` function for setting up the service. This will happen exactly once, since AngularJS services are singletons, meaning that each time the same instance is returned.

The `initialize()` function will set up the SockJS Websocket client and use it for the Stomp.js websocket client. Stomp.js is an addition to the Websocket protocol which allows subscribing and publishing to topics and also allows JSON payloads.

When the client is connected to the WebSocket server, then the `startListener()` function is called, which will listen to the `/topic/message` topic on which all messages will be received. It will then send the data to the deferred which will be used by the controllers.

The `startListener()` function calls the `getMessage()` function which will translate the Websocket data body (= payload) to the model required by the controller. In this case it will parse the JSON string to an object, and it will set the time as a `Date` object. If the message ID is listed in the `messageIds` array, then it means the message originated from this client, so it will set the `self` property to `true`.

Afterwards it will remove that message ID from the list, so that it's available again inside the message ID pool.

When the connection to the Websocket server is lost, it will call the `reconnect()` function which will attempt to initialize the connection again after 30 seconds.

Lastly, we have the two public functions of our service, `receive()` and `send()`. Let's start with the `receive()` function since this is the easiest of the two. The only thing this function does is returning the deferred used to send messages at.

The `send()` function on the other hand sends the message as a JSON object (stringified) and with a newly generated ID. This ID is added to the `messageIds` array, so that it can be used by the `getMessage()` function to check if the message was added by this client or by another client.

### Styling

That was all Java and JavaScript code we need, so let's finish our application by giving it some cool styles. I'm using the following CSS code:

```css
body, * {
  font-family: 'Open Sans', sans-serif;
  box-sizing: border-box;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  width: 80%;
}

input[type=text] {
  width: 100%;
  border: solid 1px #D4D4D1;
  transition: .7s;
  font-size: 1.1em;
  padding: 0.3em;
  margin: 0.2em 0;
}

input[type=text]:focus {
  -webkit-box-shadow: 0 0 5px 0 rgba(69, 155, 231, .75);
  -moz-box-shadow: 0 0 5px 0 rgba(69, 155, 231, .75);
  box-shadow: 0 0 5px 0 rgba(69, 155, 231, .75);
  border-color: #459be7;
  outline: none;
}

.info {
  float: right;
}

form:after {
  display: block;
  content: '';
  clear: both;
}

button {
  background: #459be7;
  color: #FFF;
  font-weight: 600;
  padding: .3em 1.9em;
  border: none;
  font-size: 1.2em;
  margin: 0;
  text-shadow: 0 0 5px rgba(0, 0, 0, .3);
  cursor: pointer;
  transition: .7s;
}

button:focus {
  outline: none;
}

button:hover {
  background: #1c82dd;
}

button:disabled {
  background-color: #90BFE8;
  cursor: not-allowed;
}

.count {
  font-weight: 300;
  font-size: 1.35em;
  color: #CCC;
  transition: .7s;
}

.count.danger {
  color: #a94442;
  font-weight: 600;
}

.message time {
  width: 80px;
  color: #999;
  display: block;
  float: left;
}

.message {
  margin: 0;
}

.message .self {
  font-weight: 600;
}

.message span {
  width: calc(100% - 80px);
  display: block;
  float: left;
  padding-left: 20px;
  border-left: solid 1px #F1F1F1;
  padding-bottom: .5em;
}

hr {
  display: block;
  height: 1px;
  border: 0;
  border-top: solid 1px #F1F1F1;
  margin: 1em 0;
  padding: 0;
}
```

### Demo

Before running our application on a webserver, check some things first. First of all, make sure you have set your context root to `/spring-ng-chat/`. If you don't do that, your AngularJS service will have troubles connecting to the WebSocket server, as it connects to `/spring-ng-chat/chat`. If you don't want this, you can always change the `SOCKET_URL` property in the AngularJS service.

Second, if you're running this application from an embedded Tomcat in Eclipse, you may have to add your Maven dependencies to your deployment assembly. You can do this by going to your project properties, clicking on Deployment assembly and by adding the library.

![deployment-assembly](images/deployment-assembly.png)

Finally, make sure that the web container you're using, supports the WebSockets Java API. If this isn't the case, you will probably have to update your web container.

If all of that is ready, then you can start running your application, which should look like this:

![initial-app](images/initial-app.png)

If you start writing your message, you will see that the button is now enabled and that the counter is running:

![app-message](images/app-message.png)

If you go too far, you will see that the button is now disabled again, and the counter is now showing a negative value in a red color:

![message-limit](images/message-limit.png)

Once you enter a message and send it, you will see that it appears in the message list as a bold message (because you sent it). You will also see that your current message is reset to an empty string in the text box:

![message-sent](images/message-sent.png)

If you open the application in a new window, you should see that it is empty now. WebSockets are real time, so only messages that are received at a given time, will be listed, there is no history.

If you send a message in the other window, you will see that the message appears in both screens. One will have it in bold, while the other one will see it as regular text.

![multiple-messages](images/multiple-messages.png)

As you can see, the WebSockets are working properly and you will see the messages appear real time because the client sends the message to the server, which will in turn send the message to all clients.

This server-client message model is only possible thanks to WebSockets.

#### Achievement: Wrote a chat application with Spring, AngularJS and SockJS

Seeing this means you finished this tutorial about writing a simple chat application using WebSockets with Spring, AngularJS and SockJS. If you're interested in the full code example, you can find it on [Github](https://github.com/g00glen00b/spring-ng-chat). If you want to try out the code yourself, you can download an archive from [Github](https://github.com/g00glen00b/spring-ng-chat/archive/master.zip).
