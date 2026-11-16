# Ansible and secure access

Terraform creates the AWS machines. Ansible is the setup crew that installs and configures
software on them, including Docker, Jenkins, SonarQube, Kubernetes, Argo CD, and monitoring.

## No SSH: use Systems Manager

The EC2 instances do not need SSH key pairs, and the project's security groups do not open port
22. Ansible uses the AWS SSM connection plugin to reach target instances. The operator runs a
PowerShell or shell wrapper locally; the wrapper asks Systems Manager to run Ansible on the
Ansible controller.

This avoids sharing a long-lived SSH private key. It does not mean access is automatic: the AWS
identity still needs the required permissions, and each instance must be registered with SSM.

## Run a playbook

From the `wanderlust-infra-config` repository, the PowerShell wrapper can run an individual
playbook or the complete site playbook:

```powershell
.\run.ps1 -Playbook sonarqube.yml -Check
.\run.ps1 -Playbook site.yml
```

`-Check` asks Ansible for check/diff mode where tasks support it. Review the output before running
the playbook without that switch. The shell equivalent is `./run.sh -C sonarqube.yml` for a check
or `./run.sh site.yml` to apply the complete site configuration.

The wrappers:

1. Sync the Ansible configuration to the project's private artifact storage.
2. Find the running controller by its project and role tags.
3. Use SSM Run Command to ask that controller to run the selected playbook.
4. The controller downloads the configuration, activates its Ansible virtual environment, and
   configures the target machines through the AWS SSM connection plugin.
5. The wrapper reports the command status and retrieves the run log from private artifact storage.

Examples of maintained playbooks include `jenkins.yml`, `sonarqube.yml`, `k8s.yml`, and
`gitops.yml`. The `site.yml` playbook coordinates the full configuration. The Ansible requirements
file installs the `amazon.aws` and `community.docker` collections, along with `community.general`
and `ansible.posix`.

## Secrets stay in Parameter Store

Passwords, GitHub tokens, JWT secrets, and database credentials are stored in AWS Systems Manager
Parameter Store as encrypted `SecureString` parameters. Ansible reads the values when it needs
them; values do not belong in Git, a playbook, a screenshot, or this public documentation.

Never paste secret output into a terminal transcript or CI log. If a credential is exposed, rotate
it in the secret store and update the service that uses it.

## What Ansible does not do

- It does not replace Terraform as the source for AWS network resources.
- It does not replace Git as the source for the Kubernetes application's desired state.
- It does not make the single-worker cluster highly available.

For the network layout, see [the AWS and Kubernetes map](architecture.md). For remote state and
safe provisioning, see [Terraform infrastructure](infrastructure.md).
