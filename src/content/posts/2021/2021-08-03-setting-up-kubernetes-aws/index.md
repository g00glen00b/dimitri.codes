---
title: "Setting up Kubernetes with Amazon EKS"
featuredImage: "/logos/kubernetes.png"
categories: ["Tutorials"]
tags: ["AWS", "Kubernetes"]
excerpt: "In this tutorial I will be setting up a Kubernetes cluster on Amazon EKS and enable the Kubernetes dashboard on it."
---

If you're planning on using containers, a platform like Kubernetes can be handy. It provides several things out of the box such as service discovery, load balancing, self healing, configuration management and many more.
On AWS, we can set up a Kubernetes cluster using the Amazon's managed Kubernetes service. This service is called the [**Elastic Kubernetes Service**](https://aws.amazon.com/eks/) or EKS.

There are several ways to set up a Kubernetes cluster on Amazon. In this tutorial I will be using [eksctl](https://eksctl.io/) since I found it the easiest tool to work with.

### Preparation

To create a cluster, we first have to install eksctl. If you're on macOS, the easiest way to install it is by using Homebrew:

```
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl
```

Alternative ways to install the eksctl can be found within [the documentation on AWS](https://docs.aws.amazon.com/eks/latest/userguide/eksctl.html).

In addition to ekctl, we also want to install kubectl to work with our Kubernetes cluster. Similar to eksctl, we can install it by using Homebrew:

```
brew install kubectl
```

For alternative ways to install kubectl, you can check [the Kubernetes documentation](https://kubernetes.io/docs/tasks/tools/).

The final thing you have to do is to create a proper credentials file so eksctl can communicate with AWS on your behalf. The easiest way to do this is by using the AWS CLI. Head over to [their website](https://aws.amazon.com/cli/) and download and run the installer.

After that, open a command prompt or terminal and enter the following command:

```
aws configure
```

When doing so, the CLI will ask for your access key and secret. If you don't have an access key yet, then log in onto [AWS](https://console.aws.amazon.com/console/home), go to IAM, select your user and go to **Security credentials**. Over there, you can generate a new access key and secret (or revoke the ones you don't need).

![AWS Access keys](./images/aws-iam-security-credentials.png)

After completing the `aws configure` prompt, you'll be able to find a folder called **.aws** within your home directory, which contains a **credentials** file.

### Creating the cluster

Now that we're completely set up, we can start using eksctl. To create a command, we can use the `eksctl create cluster` command. This command allows you to pass some parameter that set up the cluster and the nodegroup. A nodegroup is a group of nodes (EC2 servers) that will be used to deploy your applications onto.

```
eksctl create cluster \
  --name my-cluster \
  --node-type t3.small \
  --nodes 3 \
  --node-volume-size 8 \
  --node-volume-type gp2 \
  --max-pods-per-node 11 \
  --region eu-west-1
```

Using the command above, I will be creating the EKS cluster itself and three `t3a.small` EC2 nodes. Before you execute this, make sure to go over to the [AWS estimate calculator](https://calculator.aws/#/estimate) to see what this will cost.
Each of these nodes will have a disk space of 8GB and will allow 11 Kubernetes pods to be deployed on the server.

Be aware that the amount of pods you can run on a node cannot exceed the amount of IPv4 addresses there are available for that instance. The amount of available IP addresses per network interface per instance is listed within [the documentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-eni.html#AvailableIpPerENI). To calculate the maximum amount, you have to apply the following formula:

```
Maximum network interfaces x (IPv4 address per interface - 1) + 2
```

For example, for **t3.small** there is a maximum of 3 network interfaces and 4 IP addresses per interface. This means that the total amount of pods on that node will be limited to 11 (`3 x (4 - 1) + 2`). 

When estimating the size of your cluster, also take into account that Kubernetes uses rolling updates. This means that when updating it first tries to create a new (updated) pod, and then it destroys the old pod. So, if you're planning to run exactly 11 pods onto a t3.small node, there won't be enough room for updates to happen.

### Altering the nodegroup

If you do need to rescale your nodegroup, you first have to find out what the name of your nodegroup is. This can be obtained by using the following command:

```
ekstctl get nodegroup --cluster my-cluster --region eu-west-1
```

After that, you can scale your nodegroup by using the following command:

```
eksctl scale nodegroup \
  --cluster my-cluster \
  --region eu-west-1 \
  --nodes 4 \
  <my-nodegroup>
```

Be aware that it's not possible to downscale the nodegroup or to replace the instance type of the nodes. If you want to do this, you'll have to delete the old nodegroup before creating a new one. To delete the nodegroup, you can use the following command:

```
eksctl delete nodegroup --cluster my-cluster --region eu-west-1 <my-nodegroup>
```

After that, you can create a new nodegroup for your existing cluster by using the following command:

```
eksctl create nodegroup \
  --cluster my-cluster \
  --region eu-west-1 \
  --nodes 4 \
  --max-pods-per-node 11 \
  --node-type t3.small \
  --node-volume-size 8
```

### Testing it out

Once your cluster is created, you can hook up kubectl to your EKS cluster by executing the following command:

```
aws eks --region eu-west-1 update-kubeconfig --name my-cluster
```

After that, you should be able to see all running pods by using the following command:

```
kubectl get pods --all-namespaces
```

### Deploying the Kubernetes dashboard

If you don't like to use the kubectl command for monitoring your cluster, you can also use the [Kubernetes dashboard](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/).

To deploy it, you first have to install the metrics server. This can be done by applying the following configuration:

```
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.4.4/components.yaml
```

Once that's done, you should be able to verify if it's working by using the following command:

```
kubectl get deployment metrics-server -n kube-system
```

If the metrics-server is running, you can deploy the Kubernetes dashboard in a similar fashion:

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.2.0/aio/deploy/recommended.yaml
```

Now, to access the Kubernetes dashboard, we have to create a service account.  To do so, we create a new YAML file (for example **dashboard-admin.yaml**) and add the following content:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: dashboard-admin
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: dashboard-admin
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: dashboard-admin
    namespace: kube-system

```

If you deploy this configuration on Kubernetes, a new service account called "dashboard-admin" will be created. This service account will have the "cluster-admin" role, so it can access pretty much everything.

To apply this, we use kubectl:

```
kubectl apply -f dashboard-admin.yaml
```

After that, you can proxy the Kubernetes cluster by using the following command:

```
kubectl proxy
```

By doing so, you can now connect to the cluster by going to localhost. For example, the Kubernetes dashboard can be accessed from [this link](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#!/login). However, when you do so, you will be presented with a login screen:

![Login screen on Kubernetes dashboard](./images/dashboard-login.png)

To log in, we have to obtain a token for our "dashboard-admin" user. This can be done by executing the following command:

```
kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep dashboard-admin | awk '{print $1}')
```

Now you can go back to the login screen, select token and paste the bearer token. Once signed in, you should be presented with the Kubernetes dashboard.

![Overview of the Kubernetes dashboard](./images/dashboard-overview.png)

### Giving others access to kubectl

By default, only the user who created the cluster has access to it. To give access to other people, we have to add their Amazon Resource Name or ARN. To find out what their user ARN is, log into the AWS console, go to IAM and click on the user you want to add. At the top of the page, it should say "User ARN", followed by something like this:

```
arn:aws:iam::1234567890:user/MyUsername
```

In addition, select **Roles** and search for a role starting with "eksctl". The name of the role we're looking for contains the name of the nodegroup and the name of the cluster, for example `eksctl-my-cluster-nodegroup-ng-1234ab-NodeInstanceRole`. Click on that role and copy the ARN of that role. It should look something like this:

```
arn:aws:iam:1234567890:role/eksctl-my-cluster-nodegroup-ng-1234ab-NodeInstanceRole
```

The next step is to create a YAML file (eg. **aws-auth.yaml**) and add the following:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-auth
  namespace: kube-system
data:
  # This should contain the ARN of the node instance role
  mapRoles: |
    - rolearn: arn:aws:iam:1234567890:role/eksctl-my-cluster-nodegroup-ng-1234ab-NodeInstanceRole
      username: system:node:{{EC2PrivateDNSName}}
      groups:
        - system:bootstrappers
        - system:nodes
  # This should contain the ARN of the user you want to give access
  mapUsers: |
    - userarn: arn:aws:iam::1234567890:user/MyUsername
      username: MyUsername
      groups:
        - system:masters
```

After that, deploy the configuration by using the following command:

```
kubectl apply -f aws-auth.yaml
```

After that, the users will be able to see the workloads and nodes on the AWS console. If not, then make sure that their user has access to view the EKS resources.

With that, we've deployed a complete EKS cluster with dashboard on AWS!
