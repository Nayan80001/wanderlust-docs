# Checks, troubleshooting, and cleanup

Use this page as a small runbook: check one layer at a time, starting from the outside and moving
toward the application.

## A simple verification checklist

1. **Website:** open the application in the approved environment and check that the landing page
   loads.
2. **Load balancer:** confirm its target is healthy in AWS.
3. **Kubernetes:** check that the expected pods are Ready and that services exist.
4. **GitOps:** confirm the Argo CD application is `Synced` and `Healthy`.
5. **CI/CD:** check the relevant Jenkins build and identify the first failed stage.
6. **Monitoring:** review Prometheus targets, Grafana panels, and recent Loki logs.

From an authorized SSM session with the correct Kubernetes context, common read-only checks are:

```bash
kubectl get nodes
kubectl get pods -n wanderlust
kubectl get pods -n monitoring
kubectl get ingress -n wanderlust
```

Do not paste output containing private addresses or identifiers into public tickets or screenshots.

## Troubleshooting by symptom

| Symptom | First things to check |
|---|---|
| Website does not load | ALB target health, worker NodePort, ingress controller, and frontend pods |
| Frontend loads but API fails | Backend pod readiness, ingress routing, and backend logs |
| CI stops before building | The first failing security scan, unit test, SonarQube analysis, or quality gate |
| Image was built but not deployed | GitOps tag update, Argo CD sync status, and image pull events |
| Argo CD stays OutOfSync | GitOps commit, Helm rendering, application events, and cluster permissions |
| Grafana has no data | Prometheus target health, service discovery, storage, and the selected time range |
| SSM cannot reach an instance | AWS identity permissions, instance registration, and the selected region |

The failed stage or event is usually more useful than repeatedly rerunning the whole pipeline.
Fix the cause, then run the smallest relevant check again.

## Cost and cleanup

The lab's continuous-running baseline was estimated at about $313 per month before variable
charges. That estimate can change. Stopping EC2 machines does not stop all charges: the NAT
gateway, ALB, EBS volumes, and public IPv4 resources may still cost money.

Before removing the AWS lab:

1. Confirm the AWS account/profile, region, and Terraform state.
2. Review a Terraform destroy plan and identify every resource it will remove.
3. Confirm that the application stack is the intended target.
4. Destroy only after an authorized person approves the plan.
5. Preserve the protected, versioned state bucket while it may be needed.

Do not manually delete state files or use `-auto-approve` as a shortcut. Refer to the private
infrastructure guide for the exact commands and current state-backend details.

## If something is exposed

If a password, token, private key, account number, or public IP appears in a commit or screenshot,
remove the exposure from the public artifact and rotate the affected credential. Deleting a
visible line from the latest commit does not erase it from Git history.
