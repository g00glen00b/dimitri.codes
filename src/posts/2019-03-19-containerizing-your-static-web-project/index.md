---
title: "Containerizing your static web project"
date: "2019-03-19"
categories: ["JavaScript", "Tutorials"]
tags: ["Docker", "nginx", "NPM", "Web"]
---

[Last time](/web-project-webpack-babel/), we've seen how we can set up a simple web project using Babel and Webpack. More precisely, we've seen how we can both run and build the application.  
In this article, we'll see how we can containerize such a project using [Docker](https://www.docker.com/docker-community).

### Setting up a Dockerfile

The first step is to create a **Dockerfile** containing the steps necessary to run the application within a Docker container. To run some HTML, CSS and JavaScript code, we have to serve it somewhere. That means that we'll have to deploy it on a webserver like **[nginx](https://www.nginx.com/)**.

So, if we create a Dockerfile, it will likely start like this:

```dockerfile
FROM nginx:1.15.8-alpine
```

The next step is to properly copy our bundle to the right location so nginx will properly serve it. For nginx that location is **/etc/nginx/html**, so we'll use the `COPY` command like this:

```dockerfile
FROM nginx:1.15.8-alpine
COPY dist/ /etc/nginx/html
```

### Using npm scripts

Now that we have our Dockerfile, the next step is to build it. To build it, we could use the following Docker command:

```
docker build -t g00glen00b/movie-quote-consumer:0.0.1 .
```

However, a more interesting approach is to integrate this within npm. The reasoning behind this is that we can then use the same tool for building and containerizing our application.

To do this, we can add a script like this:

```json
{
  "name": "movie-quote-consumer",
  "version": "0.0.1",
  "author": {
    "name": "g00glen00b"
  },
  "scripts": {
    "start": "webpack-dev-server --open --mode development --port 8081 --env.API_URL=http://localhost:8080/api",
    "build": "webpack --mode production --env.API_URL=./movie-quote-service/api",
    "docker": "docker build -t $npm_package_author_name/$npm_package_name:$npm_package_version ."
  }
}

```

The nice thing within npm scripts is that we can use variables like `$npm_package_name` to refer to another property within the package.json file. This allows us to build the Docker image without duplicating any information.

### Running your application

To run your application, you can now use the following command:

```
docker run -p 80:80 g00glen00b/movie-quote-consumer:0.0.1
```

This will run a Docker container and expose port 80 to the host machine as port 80. This means you can open the application on `http://localhost`. This might be different though if you're running on a separate Docker machine. In that case, you'll have to replace localhost by the IP address of your Docker machine.

### Using Docker compose

Another nice feature of Docker is Docker Compose. With Docker Compose, we can define our configuration to run the Docker container as a YAML file. For example, since we exposed port 80 before, we could write a simple **docker-compose.yml** file like this in stead:

```yaml
version: '3.7'

services:
  movie-quote-consumer:
    image: g00glen00b/movie-quote-consumer:0.0.1
    ports:
      - 80:80
```

This will do the same thing as before. However, in stead of using **docker run**, you'll now have to use **docker-compose up**.

### Making network calls

One issue is that we'll probably make some API calls, perhaps even to other Docker containers. As we've seen before, we can only communicate to Docker containers if we explicitly expose a port.

Another possibility is to have inter-container network communication. This is possible by defining dependencies between our Docker containers, and works without having to expose a port to the host machine.

However, since we'll make these API calls within our JavaScript code, running within a web browser on a separate machine, we can only do this if we proxy these calls. Luckily, since we're using nginx, we already have a builtin **reverse proxy**.

First of all, let's add a dependency within the **docker-compose.yml** file:

```yaml
version: '3.7'

services:
  movie-quote-consumer:
    image: g00glen00b/movie-quote-consumer:0.0.1
    ports:
      - 80:80
    depends_on:
      - movie-quote-service
```

In this example, we're adding a dependency from this container to another container called **movie-quote-service**. Within our Docker container, we can now communicate to that service by using the container name as its hostname, for example `http://movie-quote-service:8080/api/movie-quote-service/@random` would allow us to call our backend API.

The next step is to create an **nginx.conf** file that does the proxying, for example:

```nginx
events {
    worker_connections  1024;
}

http {
    index   index.html;
    server {
        location /movie-quote-service {
            proxy_pass http://movie-quote-service:8080;
            proxy_http_version 1.1;
            rewrite ^/movie-quote-service(.*)$ $1 break;
        }
    }
}
```

This configuration will proxy all calls going to `/movie-quote-service/...` by routing them to `http://movie-quote-service:8080/...`.

The final step is to add a volume for this configuration file so that we can make sure that it's in the right spot when we run our container:

```yaml
version: '3.7'

services:
  movie-quote-consumer:
    image: g00glen00b/movie-quote-consumer:0.0.1
    ports:
      - 80:80
    depends_on:
      - movie-quote-service
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

This will map our local **nginx.conf** to **/etc/nginx/nginx.conf** within the container, which is the proper location so that nginx can pick it up.

The reason I didn't include this configuration file within my image is because the proxy rule depends on another container. If I included it within my image, and I would change the name of my other container, I would have to rebuild my image.

With that, we're now able to fully run our applications on Docker containers, huurrray! 🎉
