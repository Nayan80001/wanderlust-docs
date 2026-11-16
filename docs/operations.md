# Checks, troubleshooting, and cleanup

Use this page as a small runbook: check one layer at a time, starting from the outside and moving
toward the application. Run cluster commands only from an authorized SSM session with the correct
Kubernetes context.

## A simple verification checklist

1. **Website:** open the application in the approved environment and check that the landing page
   loads.
2. **Load balancer:** confirm its target is healthy in AWS.
3. **Kubernetes:** check that the expected pods are Ready and that services exist.
4. **GitOps:** confirm the Argo CD application is `Synced` and `Healthy`.
5. **CI/CD:** check the relevant Jenkins build and identify the first failed stage.
6. **Monitoring:** review Prometheus targets, Grafana panels, and recent Loki logs.

Common read-only checks are:

```bash
kubectl get nodes
kubectl get pods -n wanderlust
kubectl get pods -n monitoring
kubectl get ingress -n wanderlust
kubectl get events -A --sort-by=.lastTimestamp
```

Do not paste output containing private addresses or identifiers into public tickets or screenshots.

## Troubleshooting by symptom

| Symptom | First things to check |
|---|---|
| Website does not load | ALB target health, worker NodePort, ingress controller, and frontend pods |
| Frontend loads but API fails | Backend pod readiness, ingress routing, service endpoints, and backend logs |
| HTTP 5xx responses | Ingress response-code metrics, application logs, pod restarts, and upstream readiness |
| CI stops before building | The first failing security scan, unit test, SonarQube analysis, or quality gate |
| Image was built but not deployed | GitOps tag update, Argo CD sync status, and image-pull events |
| Argo CD stays OutOfSync | GitOps commit, Helm rendering, application events, and cluster permissions |
| Grafana has no data | Prometheus target health, service discovery, storage, and the selected time range |
| SSM cannot reach an instance | AWS identity permissions, instance registration, and selected region |

If Jenkins marks `Verify ArgoCD sync` as skipped, check the `VERIFY_ARGOCD` and `ARGOCD_URL`
environment values and the `argocd-token` credential. A skipped stage is not a successful health
check; see [Release and GitOps](cd-gitops.md).

## Container restart loop

1. Find the affected pod with `kubectl get pods -n wanderlust`.
2. Read its events and readiness details with `kubectl describe pod -n wanderlust <pod-name>`.
3. Read the current and previous container logs:

   ```bash
   kubectl logs -n wanderlust <pod-name>
   kubectl logs -n wanderlust <pod-name> --previous
   ```

4. Check whether the image tag is available in ECR, the required configuration is present, and
   MongoDB or Redis is reachable from the backend.
5. Fix the source or configuration in its owning repository and let the normal CI/GitOps flow
   deploy it. Use the [application rollback steps](cd-gitops.md#roll-back-an-application-release)
   if the last release caused the failure.

## Disk or persistent-storage pressure

From an authorized SSM session on the affected node, inspect the filesystem and container usage:

```bash
df -h
docker system df
```

From an authorized Kubernetes context, inspect volume claims, pods, and recent events:

```bash
kubectl get pvc -A
kubectl get pods -A
kubectl get events -A --sort-by=.lastTimestamp
```

Identify which logs, images, or volume are growing before deleting anything. Do not remove
MongoDB data, persistent-volume directories, or Docker volumes as a first response. The lab uses
local-path storage, so disk problems on the single worker can affect both the application and
monitoring.

## Domain or certificate trouble

The default configuration has no custom domain and uses the ALB DNS hostname over HTTP. If a
custom domain and HTTPS were configured:

1. Confirm the DNS record points to the intended ALB.
2. Confirm the ACM certificate is issued and still has its DNS validation record.
3. Confirm the ALB has an HTTPS listener using that certificate.
4. Check ALB target health and ingress routing separately from the certificate.

ACM can renew an eligible certificate while its validation remains in place. Do not create a
replacement certificate or change DNS without reviewing the current domain configuration.

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

Do not manually delete state files or use `-auto-approve` as a shortcut. See
[Terraform infrastructure](infrastructure.md) for the safe plan/apply process.

## If something is exposed

If a password, token, private key, account number, or public IP appears in a commit or screenshot,
remove the exposure from the public artifact and rotate the affected credential. Deleting a
visible line from the latest commit does not erase it from Git history.
