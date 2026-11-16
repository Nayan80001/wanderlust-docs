# Terraform infrastructure

Terraform is the project's construction plan. It describes the AWS resources in files so the
network and servers can be reviewed and recreated consistently.

## What Terraform creates

- One VPC, four subnets in two Availability Zones, route tables, an internet gateway, and one NAT
  gateway.
- Security groups that control which network connections are allowed.
- Five EC2 instances for Jenkins, SonarQube, Ansible, the Kubernetes control plane, and the
  Kubernetes worker.
- An Application Load Balancer, ECR image repositories, an S3 artifacts bucket, IAM roles, and SSM
  parameters.

Terraform does not install all application software. That is Ansible's job.

## Where the Terraform state lives

The production environment uses a remote S3 backend. The state bucket is versioned, encrypted,
blocked from public access, and protected against accidental destroy. Terraform uses an S3-native
lock file (`use_lockfile`) so two operators do not update the same state at the same time. The
bucket and account-specific values are intentionally not included in this public guide.

The state file can contain sensitive infrastructure data. Do not copy it into Git, publish a plan
file, or delete the state bucket as part of ordinary cleanup.

## Instance sizes

The current documented lab uses the following EC2 sizes:

| Role | Instance type | Network placement |
|---|---|---|
| Jenkins | `t3.large` | Public subnet |
| SonarQube | `t3.large` | Private subnet |
| Ansible controller | `t3.small` | Private subnet |
| Kubernetes master | `t3.medium` | Private subnet |
| Kubernetes worker | `t3.large` | Private subnet |

Changing the sizes can change both performance and cost. Check the project guide and estimate the
AWS bill before changing the deployment.

## Safe Terraform workflow

Terraform should show its proposed changes before it makes them. Work from the private
`wanderlust-infra` repository and confirm the intended AWS identity and region before running any
apply or destroy command.

```powershell
cd .\wanderlust-infra
terraform fmt -check -recursive
terraform -chdir=envs/prod init
terraform -chdir=envs/prod validate
terraform -chdir=envs/prod plan -var-file=prod.tfvars -out=tfplan
terraform -chdir=envs/prod show tfplan
```

Only after reviewing the plan and confirming every creation, update, and deletion should an
authorized operator apply it:

```powershell
terraform -chdir=envs/prod apply tfplan
```

Before running these commands, confirm the active AWS profile, account, and `us-west-2` region.
Plan files can contain sensitive values: keep `tfplan` private and do not commit it. Do not use
`-auto-approve` for this lab. Preserve the protected, versioned state bucket while the state may
still be needed.

## Cost awareness

The existing project guide's baseline estimate is about **$313 per month** for continuously
running resources, before variable traffic, storage growth, taxes, and other account-specific
charges. AWS prices change, so this is not a quote. Use the
[AWS Pricing Calculator](https://calculator.aws/) before starting or extending a lab.

Stopping EC2 instances does not stop charges for every resource. NAT gateways, load balancers,
EBS volumes, and public IPv4 addresses can continue to cost money. See
[cleanup and cost checks](operations.md#cost-and-cleanup).
