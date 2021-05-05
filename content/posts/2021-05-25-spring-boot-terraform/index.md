---
title: "Deploying your Spring boot application to AWS with Terraform"
date: "2021-05-25"
featuredImage: "../../images/logos/terraform.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "AWS", "Terraform"]
excerpt: "In this tutorial I'll deploy a simple Spring boot application on AWS by using Terraform."
---

### What is Terraform?
Developing an application requires several facets. One of those facets is to maintain its infrastructure.
Traditionally, deploying an application was a manual process, where the system engineer would create the infrastructure required to run your code (eg. database instances, servers, runtime environments and so on).

In the last decade, the digital landscape evolved a lot, and so did the infrastructure. Many people are running applications on the cloud now.
These cloud providers provide hundreds of services, each dedicated towards a specific need.

This means that setting up the infrastructure is a lot more complex than it used to be. Luckily, the tooling evolved a lot as well, and now there are several "infrastructure as code" tools.
These tools allow you to describe your infrastructure as code. In addition, they will create or destroy the infrastructure that is required.

Terraform is one of these tools. The nice thing is that it comes with a lot of modules that allow you to set up infrastructure on many cloud providers.

In this tutorial, I'll deploy a simple Spring boot application on AWS Elastic Beanstalk with Terraform.

### Terraform providers
 
First of all, head over to [terraform.io](https://www.terraform.io/downloads.html) to download Terraform on your system.
Once installed, we can start creating our first Terraform script. So let's start by creating a **provider.tf** file.

Terraform uses a specific configuration language, which is called [HCL](https://www.terraform.io/docs/language/syntax/configuration.html).
The first step is to configure which provider we want to use. In this example, we'll go for AWS:

```hcl-terraform
provider "aws" {
  region = "eu-west-1"
  shared_credentials_file = "$HOME/.aws/credentials"
}
```

There are a few things to notice here. First of all, we have to tell which region we want to use on AWS.
The region depends on several factors, such as where do you want to store your data and where do your customers live.
For example, if you're creating an application for American citizens, you probably don't want to deploy your application to a European server.

In addition, we have to tell Terraform how to log in to AWS. One possibility is through a credentials file. This credentials file is generated if you log in on AWS using the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

### Setting up an S3 bucket
To be able to deploy our application, we first have to create an S3 bucket to store our JAR file.

```hcl-terraform
resource "aws_s3_bucket" "s3_bucket_myapp" {
  bucket = "myapp-prod"
  acl = "private"
}
```

In this case, we're creating an S3 bucket called "myapp-dev", which will contain the deliverables for our production environment.

Within that bucket, we can add the JAR file as an object:

```hcl-terraform
resource "aws_s3_bucket_object" "s3_bucket_object_myapp" {
  bucket = aws_s3_bucket.s3_bucket_myapp.id
  key = "beanstalk/myapp"
  source = "target/myapp-1.0.0.jar"
}
```
