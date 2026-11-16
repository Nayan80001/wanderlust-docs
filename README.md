# Wanderlust DevOps Guide

This repository contains the public, beginner-friendly documentation for the Wanderlust
travel-blog project. It documents the architecture and delivery process without publishing
credentials, AWS account or instance identifiers, public IP addresses, or private service URLs.

The site is built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) and
published as a public, multi-page website. Share
[the guide](https://nayan80001.github.io/wanderlust-docs/) directly; readers do not need a GitHub
account.

## Preview locally

Use Python 3 and PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
mkdocs serve
```

Open the local address printed by `mkdocs serve`. To check the site exactly as CI does:

```powershell
mkdocs build --strict
```

## Keep public documentation safe

- Never add passwords, tokens, private keys, `.env` files, or secret parameter values.
- Do not publish AWS account numbers, instance IDs, public IP addresses, or private admin URLs.
- The screenshots in `docs/assets/screenshots/` are curated for public sharing.
- Source-code repositories are private; this guide describes them by name and purpose only.
