# The five repositories

The project is split into five Git repositories so each kind of work has a clear home. The
application and infrastructure repositories are private; their names below are for explaining
the system, not public source-code links.

| Repository | What belongs there |
|---|---|
| `wanderlust-frontend` | React/Vite website, frontend tests, container build, frontend CI pipeline |
| `wanderlust-backend` | Express API, MongoDB and Redis connections, backend tests, container build, backend CI pipeline |
| `wanderlust-gitops` | Helm chart, Kubernetes settings, Argo CD application, and delivery pipeline |
| `wanderlust-infra` | Terraform modules for AWS, production environment settings, and deployment guide |
| `wanderlust-infra-config` | Ansible inventory, playbooks, roles, and SSM-based run scripts |

## Why split it this way?

Imagine five labeled boxes:

- **Frontend** is the part people see and click.
- **Backend** is the helper that answers the website's requests.
- **GitOps** records which application versions Kubernetes should run.
- **Infrastructure** creates the AWS network, servers, registry, and access permissions.
- **Infrastructure config** installs and configures software on those servers.

Keeping the boxes separate makes it easier to review changes. A change to a page should not
silently rewrite the AWS network, and a Terraform change should not accidentally change an
application release.

## Which repository is the source of truth?

- Terraform code describes AWS resources.
- Ansible code describes how server software is configured.
- The GitOps repository describes the desired Kubernetes application state.
- The running cluster is checked against that desired state by Argo CD.

When the cluster and Git disagree, Git is the intended source of truth for application settings.
