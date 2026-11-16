# AWS and Kubernetes map

This page is the map of the deployed system. The AWS region is `us-west-2`. The network has one
VPC and four subnets spread across two Availability Zones (separate AWS data-center areas).

## Architecture diagram

```mermaid
architecture-beta
    group internet(cloud)[Public internet]
    group aws(cloud)[AWS region us-west-2]
    group vpc(cloud)[VPC 10.20.0.0/16] in aws
    group public_a(server)[Public AZ A - 10.20.0.0/24] in vpc
    group public_b(server)[Public AZ B - 10.20.1.0/24] in vpc
    group private_a(server)[Private AZ A - 10.20.10.0/24] in vpc
    group private_b(server)[Private AZ B - 10.20.11.0/24] in vpc

    service visitors(internet)[Website visitors] in internet
    service github(cloud)[GitHub source and GitOps] in internet
    service alb(cloud)[Public load balancer] in vpc
    service jenkins(server)[Jenkins - t3.large] in public_a
    service nat(cloud)[Single NAT gateway] in public_a
    service sonar(server)[SonarQube - t3.large] in private_a
    service ansible(server)[Ansible - t3.small] in private_a
    service master(server)[kubeadm master - t3.medium] in private_a
    service worker(server)[kubeadm worker - t3.large] in private_b
    service ingress(server)[Ingress NGINX] in private_b
    service frontend(server)[Frontend pods] in private_b
    service backend(server)[Backend pods] in private_b
    service mongo(database)[MongoDB] in private_b
    service redis(database)[Redis] in private_b
    service argocd(server)[Argo CD] in private_b
    service monitoring(server)[Prometheus, Grafana, Loki, Alloy] in private_b
    service ecr(disk)[Amazon ECR] in aws
    service s3(disk)[S3 artifacts] in aws
    service ssm(cloud)[Systems Manager] in aws

    visitors:R --> L:alb
    alb:B --> T:ingress
    ingress:R --> L:frontend
    frontend:R --> L:backend
    backend:B --> T:mongo
    backend:R --> L:redis
    jenkins:R --> L:sonar
    jenkins:B --> T:ecr
    jenkins:R --> L:argocd
    github:R --> L:jenkins
    github:B --> T:argocd
    ansible:R --> L:ssm
    ssm:B --> T:master
    ssm:R --> L:worker
    nat:R --> L:github
    worker:B --> T:s3
    monitoring:R --> L:worker
```

The drawing is a guide, not a scale map. The load balancer spans the two public subnets. The
Kubernetes control plane and worker machines are private. The application and monitoring pods run
on the worker node in this single-worker lab cluster.

## Subnets and important AWS resources

| Network area | CIDR block | Main purpose |
|---|---|---|
| VPC | `10.20.0.0/16` | Private address space for the project |
| Public subnet A | `10.20.0.0/24` | Load-balancer entry point, Jenkins, and the NAT gateway |
| Public subnet B | `10.20.1.0/24` | Second Availability Zone for the load balancer |
| Private subnet A | `10.20.10.0/24` | SonarQube, Ansible, and the Kubernetes control plane |
| Private subnet B | `10.20.11.0/24` | Kubernetes worker, application pods, and monitoring |

The internet gateway connects the public route table to the internet. Private subnets use one NAT
gateway for outbound downloads and updates; they do not get direct inbound internet routes. An S3
gateway endpoint lets the VPC reach S3 without sending that traffic through the NAT gateway.

## What happens to a web request?

1. A visitor opens the website.
2. The public Application Load Balancer (ALB) sends HTTP traffic to the Kubernetes worker's
   NodePort `30080`.
3. Ingress NGINX chooses the frontend or backend service.
4. The backend talks to MongoDB and Redis inside the cluster.
5. The security groups only allow the ALB to reach the worker's application NodePort.

The ALB is the front door. It is not the same thing as opening every EC2 server to the internet.

## How administrators reach services

SSH port 22 is not opened. AWS Systems Manager (SSM) Session Manager is the supported path for
administrative sessions and port forwarding. Jenkins, SonarQube, Argo CD, and Grafana are not
documented here with direct public admin links.

Important boundaries:

- Jenkins is placed in a public subnet, but inbound access is restricted by security-group rules;
  operators use SSM.
- SonarQube accepts its web traffic from Jenkins only.
- Argo CD's private NodePort is reachable from Jenkins only.
- Grafana is a cluster-internal service, not a public website.
- The EKS Terraform module is parked for a future phase; EKS is not part of this deployment.

## AWS instance inventory

This sanitized table was queried from the live AWS EC2 inventory. It intentionally omits account
numbers, instance IDs, DNS names, and IP addresses.

![Sanitized live AWS EC2 inventory](assets/screenshots/aws-instance-inventory.svg)

The inventory is a snapshot: instances may be stopped, replaced, or resized later.
