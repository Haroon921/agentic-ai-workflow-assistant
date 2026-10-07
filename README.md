# AI & Data Solutions Portfolio

This repository contains practical prototypes for agentic AI and Microsoft data-platform scenarios.

## Projects

### Modernize360

Modernize360 is a professional Microsoft Fabric App for data-estate modernization planning. It helps customers and partners assess database workloads, prioritize EOS risk, recommend Azure target platforms, sequence migration waves, and communicate the executive business case.

[Explore Modernize360](modernize360/README.md)

![Modernize360 Executive Overview](modernize360/docs/modernize360-overview.png)

### Agentic AI Workflow Assistant

A lightweight LangGraph and Azure OpenAI prototype that turns a user goal into a planned and executed workflow for a retail scenario.

#### Run the assistant

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirement.txt.txt
python main.py
```

Configure the Azure OpenAI environment values required by `main.py` before running the assistant. Do not commit credentials or local `.env` files.

## Repository principles

- Keep credentials and tenant-specific configuration out of source control.
- Treat included sample data and modeled business values as illustrative.
- Validate each project using the commands documented in its own README.
