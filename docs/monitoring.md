# Monitoring

The monitoring stack helps the team answer three practical questions: Is the application
responding? Is it getting slower? What do the service logs show?

| Tool | What it does here |
|---|---|
| Prometheus | Collects metrics and evaluates alert rules |
| Grafana | Shows dashboards and lets operators explore metrics and logs |
| Loki | Stores application logs for searching |
| Grafana Alloy | Collects pod logs and Kubernetes events for Loki |

Prometheus also collects request metrics from ingress-nginx. Grafana is a private cluster service;
it is not exposed through the public load balancer.

[![Full Grafana overview showing alert status, request rate, and latency](assets/screenshots/grafana-overview-full.png)](assets/screenshots/grafana-overview-full.png){.document-screenshot-link target=_blank rel=noopener}

*The captured dashboard shows alert status, request rate, and latency. Its private endpoint was removed for publication. The displayed values cover the dashboard's selected time range only.*

## Current limits

This is a lab-sized monitoring setup, not an independent or highly available monitoring service.
The application and monitoring tools run on the same Kubernetes worker. If that worker stops,
the website and its monitoring can both be interrupted.

- Metrics and logs use the cluster's existing local-path storage.
- Prometheus and Loki retain a limited seven-day window.
- Alert rules are evaluated locally, but no external notification receiver is configured.

An alert visible in Grafana does not by itself notify an on-call person. Production operations
would need an external notification path, a response owner, and a tested recovery process.

## Access

Grafana is private. Authorized operators reach it through the documented SSM port-forwarding
procedure and retrieve its password from the encrypted parameter store. Do not put credentials or
private service addresses in this guide.
