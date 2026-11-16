# Technology stack and tooling

This is the tool list for the current project configuration. A version recorded in a lock file or
chart is more precise than a floating container tag. Where the project does not pin a version, the
table says so instead of guessing.

## Application and data

| Layer | Technology | Configured version |
|---|---|---|
| Frontend | React | `18.2.0` |
| Frontend build | Node.js container | `20-alpine` |
| Frontend web server | Unprivileged Nginx container | `1.29-alpine` |
| Backend | Node.js container and Express | Node `20-alpine`; Express `4.18.2` |
| Database | MongoDB | `7.0` |
| Cache/session service | Redis | `7.2-alpine` |

## AWS infrastructure and Kubernetes

| Layer | Technology | Configured version or setting |
|---|---|---|
| Infrastructure as code | Terraform CLI | `>= 1.10` |
| Terraform AWS provider | AWS provider | `>= 5.70, < 6.0`; lock file selects `5.100.0` |
| Terraform utility provider | Random provider | Lock file selects `3.9.1` |
| Configuration management | Ansible collections | `amazon.aws >= 8.0.0`, `community.docker >= 3.10.0`, plus `community.general` and `ansible.posix` |
| Kubernetes | kubeadm cluster | `1.30.9`, pinned and held by the setup |
| Kubernetes networking | Calico | `v3.28.2` |
| Kubernetes metrics API | metrics-server | `0.7.2` |
| Persistent volumes | local-path provisioner | `v0.0.30` |
| Kubernetes package manager | Helm | `3.15.4` |
| GitOps controller | Argo CD chart | `7.6.12` |
| Ingress controller | ingress-nginx chart | `4.11.3` |

## CI/CD, quality, and operations

| Area | Technology | Configured version or setting |
|---|---|---|
| CI | Jenkins | Core and plugins are not pinned to exact versions in this project |
| Jenkins plugin management | Plugin Manager | `2.13.0` |
| Code quality | SonarQube Community | Image tag is `sonarqube:community` and is not an immutable version pin |
| SonarQube database | PostgreSQL | `16` |
| Unit tests | Jest | Used by both application pipelines; the pipeline runs `npm ci` from the lock file |
| Security and image checks | Gitleaks, Trivy, OWASP Dependency-Check, Hadolint | Tool versions are not all pinned in the application Jenkinsfiles |
| Metrics and dashboards | kube-prometheus-stack | Chart `93.3.0` |
| Log storage | Loki | Chart `21.2.3` |
| Log collection | Grafana Alloy | Chart `1.16.0` |
| Public guide | MkDocs Material and Mermaid | Mermaid runtime `11.1.0` |
| Guide deployment | GitHub Pages | GitHub Actions publishes the documentation repository |

GitHub is the source-code and GitOps host. AWS provides the virtual network, EC2 instances,
Application Load Balancer, ECR, S3, Systems Manager, Parameter Store, CloudWatch, and (if a custom
domain is configured) Route 53 and ACM.

## Versioning notes

- The application image tag is based on an eight-character source commit and the Jenkins build
  number. It is an immutable release identifier for this pipeline.
- Terraform provider versions are constrained and locked. Review the lock file when updating
  providers.
- Some installed service tags, especially `sonarqube:community`, are floating. Jenkins core and
  plugins are also not fixed to a tested version set. This can change behavior after a rebuild.
- Before treating this lab as a production service, pin the remaining floating images and tools,
  then test upgrades in a non-production environment.

For the network layout, see [AWS and Kubernetes](architecture.md). For what happens on each
pipeline run, see [Jenkins checks](ci.md) and [Release and GitOps](cd-gitops.md).
