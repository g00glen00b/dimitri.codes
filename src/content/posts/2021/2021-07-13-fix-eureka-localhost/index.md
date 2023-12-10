---
title: "How to fix services registering as localhost on Eureka"
featuredImage: "/logos/spring.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "Spring cloud", "Eureka", "Netflix"]
excerpt: "If you used Eureka before, you may have noticed that services sometimes register as localhost in stead of the prefered servers hostname. In this tutorial I'll explain why that happens and how to fix it."
---

### What is Eureka
If you've been using Spring cloud to develop microservices, chances are, you might have used [Eureka](https://spring.io/guides/gs/service-registration-and-discovery/).

Eureka is a service registry, which means microservices use it to register themselves. This allows other applications and services to look up the address of a microservice through the registry. 
The benefit of that is that you no longer have to rely on hardcoded hostnames and ports, because these could change.

Eureka is often used with either Feign or Ribbon, which will resolve the hostname for you, and provide client-side loadbalancing if there are multiple instances of the same microservices.

Nowadays you see less people using Eureka, since there are other alternatives on the market such as container orchestration (eg. Kubernetes).

### The localhost problem
One issue with Eureka is that services sometimes accidentally register themselves as localhost. This causes issues, because applications on other servers will now try to connect to the microservice on localhost, rather than the proper location.

When searching on the internet for solutions, people often tell you to use IP addresses in stead. However, this is rather just a workaround, and not a solution to the problem.

### Diving into the code
If you take a look at the code, you'll see that the way Spring relies on a class called [`InetUtils`](https://www.javadoc.io/doc/org.springframework.cloud/spring-cloud-commons/latest/org/springframework/cloud/commons/util/InetUtils.html) to resolve the hostname.

The way this class works is the following. First of all, it retrieves a list of all network interfaces.
After that, it will loop over all network interfaces, and find the first IPv4 network address of those interfaces. (See [`InetUtils.findFirstNonLoopbackAddress()`](https://github.com/spring-cloud/spring-cloud-commons/blob/f1b3956722cbcdbafd2a1dadb651f3bcb9ea2c26/spring-cloud-commons/src/main/java/org/springframework/cloud/commons/util/InetUtils.java#L74-L124))

Once it retrieve that address, it will register that application with the hostname of that address (See [`InetUtils.convertAddress()`](https://github.com/spring-cloud/spring-cloud-commons/blob/f1b3956722cbcdbafd2a1dadb651f3bcb9ea2c26/spring-cloud-commons/src/main/java/org/springframework/cloud/commons/util/InetUtils.java#L161-L176)).

Before we take a look at why this might fail, we first have to enable debug logging for the `InetUtils`class. This can be done by adding the following application property:

```yaml
logging:
  level:
    org.springframework.cloud.commons.util.InetUtils: trace
```

Now, let's dive into the reasons why the lookup might fail.

### Problem 1: It picked the wrong network interface
One possibility why you get the wrong hostname is because it picked the wrong network interface or address.  To find out which network interface is used, you can check the logs for the following messages:

```
Testing interface: Software Loopback Interface 1
Testing interface: vmxnet3 Ethernet Adapter
Found non-loopback interface: vmxnet3 Ethernet Adapter
```

As you can see, in this example, the "vmxnet3 Ethernet Adapter" was picked. If this isn't the proper network interface, you can ignore it by configuring the `spring.cloud.inetutils.ignored-interfaces` property: 

```yaml
spring:
  cloud:
    inetutils:
      ignored-interfaces:
        # You can use wildcards as well
        - vmxnet3*
```

Make sure not to ignore all network interfaces, as this will cause issues as well.

### Problem 2:  An error occurred when looking up the network interfaces

When an error occurs, the `InetUtils` class will try to retrieve the  local host address by calling `InetAddress.getLocalHost()`. If that fails, it will rely on a fallback property called `spring.cloud.inetutils.default-hostname`.

To see whether this happens, look either for a message "Cannot get first non-loopback address", followed by an exception, or for the "Unable to retrieve localhost" message.

### Problem 3: No network interface could be found

If no network interface or address could be found, the same will happen as when an error occurs. 

To verify whether this is the case, there should be no message within the logs starting with "Testing interface" and the "Found non-loopback interface" logging message should also be absent.

Be aware, there are certain properties that limit which network interfaces or IP addresses are accepted.
For example, we already mentioned that `spring.cloud.inetutils.ignored-interfaces`  can be used to ignore certain network interfaces.

In addition, you can also limit the addresses by configuring the preferred ranges:

```yaml
spring:
  cloud:
    inetutils:
      preferred-networks:
        - 192.168
```

That means that if either of these are wrongly configured, no address might be found.

### Problem 4: Resolving the hostname takes too long
The most common issue that causes `localhost` to be used is when it takes too long to resolve the hostname. To verify whether this is the case, you have to look for the following message within the logs:

```
Cannot determine local hostname
```

As you can see in [`InetUtils.convertAddress()`](https://github.com/spring-cloud/spring-cloud-commons/blob/main/spring-cloud-commons/src/main/java/org/springframework/cloud/commons/util/InetUtils.java#L167), there is a time limitation. By default, this is **1 second**. 
This means that if it takes more than one second to resolve the hostname, the code will fall back on `localhost`. 
Beware, this fallback is hardcoded and changing the `spring.cloud.inetutils.default-hostname`  property will have no effect.

Luckily, we can increase the amount of seconds it takes before the fallback is being used. For example:

```yaml
spring:
  cloud:
    inetutils:
      timeout-seconds: 10
```

### Conclusion

As you can see, microservices don't just register themselves randomly as localhost. There's always a clear cause, and enabling trace logging or debugging the `InetUtils` class will be helpful to find out why. 

There are also several properties that affect how `InetUtils` behaves, which I listed before. For more information about these properties, you can always check the [Spring Cloud Commons Appendix A](https://cloud.spring.io/spring-cloud-commons/reference/html/appendix.html). When doing so, make sure to look for properties starting with `spring.cloud.inetutils`.