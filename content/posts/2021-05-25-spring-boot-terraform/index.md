---
title: "Deploying your Spring boot application to AWS with Terraform"
date: "2021-05-25"
featuredImage: "../../images/logos/terraform.png"
categories: ["Java", "Tutorials"]
tags: ["Spring", "Spring boot", "AWS", "Elastic Beanstalk", "Terraform"]
excerpt: "In this tutorial I'll deploy a simple Spring boot application on AWS by using Terraform."
---


### What is Terraform?

Developing an application requires several facets. One of those facets is to maintain its infrastructure.
Traditionally, deploying an application was a manual process, where the system engineer would create the infrastructure required to run your code (eg. database instances, servers, runtime environments and so on).

In the last decade, the digital landscape evolved a lot, and so did the infrastructure. Many people are running applications on the cloud now.
These cloud providers provide hundreds of services, each dedicated towards a specific need.

This means that setting up the infrastructure is a lot more complex than it used to be. Luckily, the tooling evolved a lot as well, and now there are several "infrastructure as code" tools.
These tools allow you to describe your infrastructure as code. In addition, they will create or destroy the infrastructure that is required.

[Terraform](https://www.terraform.io/) is one of these tools. The nice thing is that it comes with a lot of modules that allow you to set up infrastructure on many cloud providers.

In this tutorial, I'll deploy a simple Spring boot application on AWS Elastic Beanstalk with Terraform.

![Terraform + Elastic Beanstalk + Spring boot logos](images/terraform-beanstalk-springboot.png)

### Terraform providers
 
First of all, head over to [terraform.io](https://www.terraform.io/downloads.html) to download Terraform on your system.
Once installed, we can start creating our first Terraform script. So let's start by creating a **provider.tf** file.

Terraform uses a specific configuration language, which is called [HCL](https://www.terraform.io/docs/language/syntax/configuration.html).
The first step is to configure which provider we want to use. In this example, we'll go for AWS:

```hcl
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

To be able to deploy our application, we first have to store our JAR file on AWS somewhere. Typically, we use an S3 bucket to do this.
To configure this, I'm going to create a new Terraform file called **main.tf**:

```hcl
resource "aws_s3_bucket" "s3_bucket_myapp" {
  bucket = "myapp-prod"
  acl = "private"
}
```

In this case, we're creating an S3 bucket called "myapp-dev", which will contain the deliverables for our production environment.

Within that bucket, we can add the JAR file as an object:

```hcl
resource "aws_s3_bucket_object" "s3_bucket_object_myapp" {
  bucket = aws_s3_bucket.s3_bucket_myapp.id
  key = "beanstalk/myapp"
  source = "target/myapp-1.0.0.jar"
}
```

To configure this, we first have to tell which bucket we want to use. The nice thing is that we can refer to other Terraform resources.
In this case, we use `aws_s3_bucket.s3_bucket_myapp.id` to refer to the unique identifier of the bucket we want to use.

In addition, we have to provide the location of the JAR file. Currently, I'm putting the Terraform scripts within the root folder of my project.
That means that I can find the JAR file within the target-folder.
At the moment, we're hardcoding the version, but I'll show you how we can fix that later on.


### Setting up Elastic Beanstalk

To deploy our application, I'm going to use Elastic Beanstalk. Elastic Beanstalk is your typical platform as a service (PaaS).
You provide an application, and your cloud provider provides everything else up until a runtime (eg. a JRE).

Within the Terraform scripts, we first have to create an application:

```hcl
resource "aws_elastic_beanstalk_application" "beanstalk_myapp" {
  name = "myapp"
  description = "The description of my application"
}
``` 

After that, we have to create a version, in which we can tell AWS where to find our application:

```hcl
resource "aws_elastic_beanstalk_application_version" "beanstalk_myapp_version" {
  application = aws_elastic_beanstalk_application.beanstalk_myapp.name
  bucket = aws_s3_bucket.s3_bucket_myapp.id
  key = aws_s3_bucket_object.s3_bucket_object_myapp.id
  name = "myapp-1.0.0"
}
```
As you can see, this is where everything we did so far comes together. By using the `bucket` and `key` properties, we tell Terraform/AWS where to find our JAR-file.

The last part is to create a proper environment. To set up the environment, we first have to determine the solution stack name.
This is a specific label that indicates which operating system and Java runtime we want to use. 
Check [the documentation](https://docs.aws.amazon.com/elasticbeanstalk/latest/platforms/platforms-supported.html#platforms-supported.javase) for a list of supported solution stack names.

In this example, I'll run my application on Java 11, so I decided to use "64bit Amazon Linux 2 v3.1.8 running Corretto 11".

For example:

```hcl
resource "aws_elastic_beanstalk_environment" "beanstalk_myapp_env" {
  name = "myapp-prod"
  application = aws_elastic_beanstalk_application.beanstalk_myapp.name
  solution_stack_name = "64bit Amazon Linux 2 v3.1.7 running Corretto 11"
  version_label = aws_elastic_beanstalk_application_version.beanstalk_myapp_version.name
 
  // ...
}
```

However, this won't work yet. First of all, Elastic beanstalk will proxy calls to port 5000. 
That means we have to run our application on that port.

Luckily, with Spring boot we can configure the port by setting the `SERVER_PORT` environment variable:

```hcl
resource "aws_elastic_beanstalk_environment" "beanstalk_myapp_env" {
  name = "myapp-prod"
  application = aws_elastic_beanstalk_application.beanstalk_myapp.name
  solution_stack_name = "64bit Amazon Linux 2 v3.1.7 running Corretto 11"
  version_label = aws_elastic_beanstalk_application_version.beanstalk_myapp_version.name

  setting {
    name = "SERVER_PORT"
    namespace = "aws:elasticbeanstalk:application:environment"
    value = "5000"
  }
  
  // ...
}
```

Another setting we have to configure is the instance type. When we run an application on Elastic Beanstalk, AWS will create an EC2 instance.
EC2 or Elastic Compute Cloud is another service that's offered by AWS and provides certain CPU and memory capacity.

In my case, I'm going to run on a fairly small instance type called "t2.micro". You can find a list of instance types within [the documentation](https://aws.amazon.com/ec2/instance-types/).

To configure the instance type, I'll use:

```hcl
resource "aws_elastic_beanstalk_environment" "beanstalk_myapp_env" {
  name = "myapp-prod"
  application = aws_elastic_beanstalk_application.beanstalk_myapp.name
  solution_stack_name = "64bit Amazon Linux 2 v3.1.7 running Corretto 11"
  version_label = aws_elastic_beanstalk_application_version.beanstalk_myapp_version.name

  setting {
    name = "SERVER_PORT"
    namespace = "aws:elasticbeanstalk:application:environment"
    value = "5000"
  }

  setting {
    namespace = "aws:ec2:instances"
    name = "InstanceTypes"
    value = "t2.micro"
  }

  // ...
}
```

Note, you might also find articles mentioning the use of the **InstanceType** setting within the **aws:autoscaling:launchconfiguration** namespace.
This does the same thing, but according to [the documentation](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.managing.ec2.html#using-features.managing.ec2.namespace), the new **aws:ec2:instances** namespace if prefered for configuring the instance type.

Another setting I had to configure to make it work is to provide an IAM profile. AWS Identity and Access Management or IAM allows you to finetune permissions to access certain resources.
If you're not interested in configuring these, you can also work with the [default instance profile for Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/iam-instanceprofile.html), called `aws-elasticbeanstalk-ec2-role`.

```hcl
resource "aws_elastic_beanstalk_environment" "beanstalk_myapp_env" {
  name = "myapp-prod"
  application = aws_elastic_beanstalk_application.beanstalk_myapp.name
  solution_stack_name = "64bit Amazon Linux 2 v3.1.7 running Corretto 11"
  version_label = aws_elastic_beanstalk_application_version.beanstalk_myapp_version.name

  setting {
    name = "SERVER_PORT"
    namespace = "aws:elasticbeanstalk:application:environment"
    value = "5000"
  }

  setting {
    namespace = "aws:ec2:instances"
    name = "InstanceTypes"
    value = "t2.micro"
  }
  
  setting {
   namespace = "aws:autoscaling:launchconfiguration"
   name = "IamInstanceProfile"
   value = "aws-elasticbeanstalk-ec2-role"
  }
}
```

### Testing it out

After configuring the Elastic Beanstalk environment, you can start testing it out.
To do this, we first have to initialize the Terraform folder structure. This can be done with the following command:

```
terraform init
```

After that, you can create your resources by running the following command:

```
terraform apply
```

Once that's done, your application should be up and running on AWS.

### Changing the backend type

When we run `terraform apply`, the state of your infrastructure is stored within the folders that were generated during the `terraform init` command.
This makes it difficult to work on the project with multiple people. To solve that issue, we can store the Terraform state on AWS as well.

To do this, we have to open **provider.tf** again and add a [backend](https://www.terraform.io/docs/language/settings/backends/s3.html):

```hcl
terraform {
  backend "s3" {
    bucket = "terraform-state-bucket-eu-west-1"
    key = "myapp/terraform.tfstate"
    shared_credentials_file = "$HOME/.aws/credentials"
    region = "eu-west-1"
    dynamodb_table = "terraform-locks"
    encrypt = true
  }
}
```

Be aware, when running this setup, you have to create the S3 bucket and DynamoDB table beforehand.

### Working with variables

As you've seen before, we hardcoded certain things like the version of our application and the name of the environment (myapp-prod).
To solve that, we can use [variables](https://www.terraform.io/docs/language/values/variables.html). The first step is to define what variables we'll use. To do this, I'll create a **variables.tf** file with the following contents:

```hcl
variable "myapp_version" {
  type = "string"
}

variable "environment_suffix" {
  type = "string"
}
```

The next part is to use the variables where necessary. For example, within the `beanstalk_myapp_env` resource I can change the name to this:

```hcl
resource "aws_elastic_beanstalk_environment" "beanstalk_myapp_env" {
  name = "myapp-${var.environment_suffix}"
  // ...
}
```

I can do the same thing for the S3 bucket where I store my JAR file. Whether you need this depends on whether you build different JAR files for different environments.

```hcl
resource "aws_s3_bucket" "s3_bucket_myapp" {
  bucket = "myapp-${var.environment_suffix}"
  acl = "private"
}
```

In addition, we can use `${var.myapp_version}` for the source of the S3 object.

```hcl
resource "aws_s3_bucket_object" "s3_bucket_object_myapp" {
  bucket = aws_s3_bucket.s3_bucket_myapp.id
  key = "beanstalk/myapp"
  source = "target/myapp-${var.myapp_version}.jar"
}
```

And finally, we can use the same variable for the Elastic Beanstalk version:

```hcl
resource "aws_elastic_beanstalk_application_version" "beanstalk_myapp_version" {
  application = aws_elastic_beanstalk_application.beanstalk_myapp.name
  bucket = aws_s3_bucket.s3_bucket_myapp.id
  key = aws_s3_bucket_object.s3_bucket_object_myapp.id
  name = "myapp-${var.myapp_version}"
}
```

If you want to work with these variables now, you can use the `-var` parameter:

```
terraform apply -var="environment_suffix=prod" -var="myapp_version=1.0.0"
```

Alternatively, you can create a file called **production.tfvars** and add the following contents:

```
environment_suffix=prod
myapp_version=1.0.0
```

Then you can use the file like this:

```
terraform apply -var-file="production.tfvars"
```

By doing so, you now deployed your Spring boot application on AWS using Terraform!
You might think that this is overkill, since you can easily deploy a Spring boot application using the AWS CLI, or other tools.
The benefit of using Terraform comes when you need to manage additional infrastructure, such as databases, other S3 buckets for your application and so on.
Since Terraform allows you to refer to other resources, it makes setting up your infrastructure less error-prone.