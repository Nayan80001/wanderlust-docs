# Ansible and secure access

Ansible is the setup crew. Terraform creates the machines; Ansible installs and configures the
software on them, including Docker, Jenkins, SonarQube, Kubernetes, Argo CD, and monitoring.

## No SSH: use Systems Manager

The EC2 instances do not need SSH key pairs, and the project's security groups do not open port 22.
Ansible uses the AWS SSM connection plugin to reach the machines. The operator starts a run from
the configured Ansible controller/run script, and SSM carries the command.

This avoids sharing a long-lived SSH private key. It does not mean access is automatic: the AWS
identity still needs the correct permissions, and the instance must be registered with SSM.

## How the run scripts work

The `wanderlust-infra-config` repository has PowerShell and shell scripts. At a high level, the
scripts:

1. Find the EC2 instances from their project and role tags.
2. Stage the Ansible configuration in the project's artifact storage.
3. Ask the Ansible controller to run a selected playbook through SSM.
4. Show the run result and its log location.

The playbooks can be run one service at a time or as a complete site configuration. Examples from
the private configuration repository include `jenkins.yml`, `sonarqube.yml`, `k8s.yml`, and
`gitops.yml`.

## Secrets stay in Parameter Store

Passwords, GitHub tokens, JWT secrets, and database credentials are stored in AWS Systems Manager
Parameter Store as encrypted `SecureString` parameters. Ansible reads the values when it needs
them; the values do not belong in Git, a playbook, a screenshot, or this public documentation.

Never paste secret output into a terminal transcript or CI log. If a credential is exposed, rotate
it in the secret store and update the service that uses it.

## What Ansible does not do

- It does not replace Terraform as the source for AWS network resources.
- It does not replace Git as the source for the Kubernetes application's desired state.
- It does not make the single-worker cluster highly available.

For the network layout, see [the AWS and Kubernetes map](architecture.md).
