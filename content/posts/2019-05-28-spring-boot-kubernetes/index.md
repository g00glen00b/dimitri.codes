---
title: "Running your Spring boot application on Kubernetes"
date: "2019-05-28"
featuredImage: "../../images/logos/kubernetes.png"
categories: ["Java", "Tutorials"]
tags: ["Docker", "Kubernetes", "Minikube", "Spring", "Spring boot"]
excerpt: "Kubernetes has been the way to go to orchestrate containerized applications. In this tutorial, we'll see how we can use Kubernetes with Spring boot."
---

A few weeks ago, I've covered how you can properly [create Docker images for your Spring boot application](/docker-spring-boot/). Last time, we've also seen how to [set up Kubernetes locally with Minikube](/setting-up-minikube-istio-macos). Now, it's time to combine the two, and deploy a Spring boot application on Kubernetes.

### Creating a deployment

![Spring boot + Kubernetes](images/spring-boot-kubebrnetes.png)

The first step, when trying to deploy an application with Kubernetes is to describe the [deployment/pods](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) itself within a YAML file. To do this, I'm going to use the following YAML configuration:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: movie-quote-service-deployment
  labels:
    app: movie-quote-app
    tier: backend
spec:
  selector:
    matchLabels:
      app: movie-quote-app
      tier: backend
  template:
    metadata:
      labels:
        app: movie-quote-app
        tier: backend
    spec:
      containers:
        - name: movie-quote-service
          image: g00glen00b/movie-quote-service:0.0.1
          ports:
            - containerPort: 8080
              name: service-port
```

We start by defining some labels, such as **app=movie-quote-app** and **tier=backend**. We can then use these labels to define which containers should be deployed.

In this case, I have a Docker image called **[g00glen00b/movie-quote-service](https://cloud.docker.com/u/g00glen00b/repository/docker/g00glen00b/movie-quote-service)**, which will expose port 8080, so I added that as well.

### Creating a secret

The application we're planning to deploy connects to a database, and thus, we'll use [Kubernetes secrets](https://kubernetes.io/docs/concepts/configuration/secret/) to configure the passwords properly. In this example, I'll store these secrets within my YAML configuration file.

By default, secrets have to be base64 encoded first. So, let's generate those base64 strings first:

```
echo -n "dbuser" | base64
echo -n "dbpass" | base64
echo -n "P@$$w0rd" | base64
```

Please note, you have to add the `-n` flag, otherwise a newline will be appended to the end, and that will be encoded as well.

Now you can add the following configuration to your YAML file:

```yaml
---
apiVersion: v1
kind: Secret
metadata:
  name: mysql-login
data:
  rootPassword: UEAkJHcwcmQK
  username: ZGJ1c2VyCg==
  password: ZGJwYXNzCg==
```

Obviously, if you want to expose your database somehow, you probably don't want to publish these credentials.

### Using a secret

Once you've setup your secret, you can use it within environment variables by using the `secretKeyRef` property, for example:

```yaml
name: movie-quote-service-deployment
image: g00glen00b/movie-quote-service:0.0.1
# ports: ...
env:
  - name: SPRING_DATASOURCE_URL
    value: "jdbc:mysql://localhost:3306/quotes?useSSL=false&allowPublicKeyRetrieval=true"
  - name: SPRING_DATASOURCE_USERNAME
    valueFrom:
      secretKeyRef:
        name: mysql-login
        key: username
  - name: SPRING_DATASOURCE_PASSWORD
    valueFrom:
      secretKeyRef:
        name: mysql-login
        key: password
```

As you can see, we're configuring both `SPRING_DATASOURCE_USERNAME` and `SPRING_DATASOURCE_PASSWORD` by referring to a secret. You don't have to use secrets though, as seen within `SPRING_DATASOURCE_URL`.

### Limiting resources

If you want to [limit the resources](https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container) that are available to your container, you can use the `resources` property within your YAML configuration file for your container, for example:

```yaml
name: movie-quote-service-deployment
image: g00glen00b/movie-quote-service:0.0.1
# env: ...
# ports: ...
resources:
  requests:
    memory: "128Mi"
    cpu: "250m"
  limits:
    memory: "256Mi"
    cpu: "1000m"
```

In this example, we limited the memory to 256Mb of RAM, and 1 CPU. The "m" for the CPU stands for "milli", and thus 1000m is 1 CPU.

### Configuring health checks

In Kubernetes, we can configure two types of [health checks](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-probes/):

- The **liveness probe** can be used to configure when an application is actually down when it has been running fine for a while. Possible causes could be memory issues, connections going stale, running out of disk space and so on.
- The **readiness probe** can be used to configure when an application is still starting up. In some cases, applications might require some additional time to load initial datasets and so on. With the readiness probe, we tell Kubernetes when an application is ready to accept requests.

With Spring boot, we could use any endpoint for the liveness probe. If the application is going out of memory, or has other availability issues, that endpoint won't be available. One possibility is to use the `/actuator/info` endpoint.

**Note:** Do not use the `/actuator/health` endpoint or any other endpoint that relies on third party services to determine the outcome. The reason this could be bad is because if your database is down, you don't want Kubernetes to be restarting your Spring boot application.

To configure this, we can use the following configuration:

```yaml
name: movie-quote-service-deployment
image: g00glen00b/movie-quote-service:0.0.1
ports:
  - containerPort: 8080
    name: service-port
# env: ...
# resources: ...
livenessProbe:
  httpGet:
    port: service-port
    path: /actuator/info
  initialDelaySeconds: 30
  timeoutSeconds: 10
```

So, we're using the **/actuator/info** endpoint, configured the application with an initial delay of 30 seconds to guarantee that the application has started, and with a timeout of 10 seconds in case the application goes unresponsive.

We also have to define on which port the liveness probe could be found. The nice thing is that we can just refer to the **service-port** which we defined earlier in the `ports` section.

Make sure that the initial delay covers the startup time of your application. If your application requires about 20 seconds to start up, you could add another 10 seconds and configure an initial delay of 30 seconds. Otherwise, your application could go in a restart loop if your application wasn't able to start up in time.

### Configuring the readiness probe

The readiness probe on the other hand, can rely on third party services to determine its outcome. If the database is unavailable, you don't want requests to end up to this pod. So, in this case, we can use the **/actuator/health** endpoint:

```yaml
name: movie-quote-service-deployment
image: g00glen00b/movie-quote-service:0.0.1
ports:
  - containerPort: 8080
    name: service-port
# env: ...
# resources: ...
# livenessProbe: ...
readinessProbe:
  httpGet:
    port: service-port
    path: /actuator/health
  initialDelaySeconds: 20
  timeoutSeconds: 5
```

It doesn't have to be a HTTP endpoint though. You could use other types of probes, such as a TCP probe, a command that has to be executed, ... .

### Defining a service

To expose your applications to the outer world, we define a service. Much like a proxy, they route traffic to the actual container. There are several kinds of services, some of which could provide load balancing and such. However, when running Kubernetes locally, we have only access to the **NodePort** service.

The NodePort service requires two ports to be configured. First, you have to configure which port it should forward to. Second, you have to configure on which port you want to expose the application.

NodePort services can only be exposed to ports within the 30000-32767 range:

```yaml
---
apiVersion: v1
kind: Service
metadata:
  name: movie-quote-service
  labels:
    app: movie-quote-app
    tier: backend
spec:
  ports:
    - name: http
      nodePort: 30080
      port: 8080
  type: NodePort
  selector:
    app: movie-quote-app
    tier: backend
```

Just like before, we use the labels to properly configure the NodePort. In this case, our application will be available within the Kubernetes cluster on port **30080**.

### Running on Minikube

Now that we defined both the secret, deployment and the service, we can start deploying them on Minikube.

First of all, make sure that Minikubeb is up and running:

```
minikube ip
```

If this command doesn't return a proper IP address, you can start Minikube using the following command:

```
minikube start
```

Once Minikube is up and running, you can deploy the containers using **kubectl**:

```
kubectl apply -f kubefiles/movie-quote-service.yml
```

Now you can verify if the application is running by using the following commands:

```
kubectl get pods
kubectl get svc
```

The "movie-quote-service" pod should have the status "Running", and the services should contain a service called "movie-quote-service" active on port 30080.

Additionally, you could use the Minikube dashboard to see the status of your pods:

![Screenshot of Minikube dashboard with Spring boot application deployed](images/Screenshot-2019-04-05-09.37.20.png)

### Opening your application

Now that our application is running on Kubernetes, you can test it out. First you have to find out on which IP address Minikube is running. If you used a virtual machine (eg. virtualbox) as the driver, this won't be your local IP address.

```
minikube ip
```

Now that you know the IP address, you should be able to visit your application on port 30080.

Alternatively, you can also forward the port to your local machine, by using the **port-forward** command:

```
kubectl port-forward svc/movie-quote-service 8080:8080
```

While this is running, you should be able to visit your application on `http://localhost:8080`.

So there you have it, you now have your Spring boot application up and running on Kubernetes.
