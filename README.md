# Agentic AI Workflow Assistant

This is a simple **Agentic AI Workflow Assistant** built with **LangGraph** and **Azure OpenAI** for a retail scenario.

## 📌 What it does

- Accepts a goal (e.g., "Restock low inventory items")
- Uses a planner node (LLM) to break the goal into steps
- Executes tasks (mock API calls)
- Runs the flow step-by-step with LangGraph

## 🚀 How to run

1- Clone the repo
```bash
git clone https://github.com/YOUR-USERNAME/agentic-ai-workflow-assistant.git
cd agentic-ai-workflow-assistant

2 - Set up a virtual environment
python -m venv venv
# Activate:
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

3 - Install dependencies
pip install -r requirements.txt

4 - Set your environment variables
# On Windows PowerShell
setx OPENAI_API_KEY "YOUR_AZURE_OPENAI_KEY"
setx OPENAI_API_BASE "YOUR_AZURE_OPENAI_ENDPOINT"
setx AZURE_OPENAI_DEPLOYMENT "YOUR_DEPLOYMENT_NAME"
setx OPENAI_API_VERSION "2024-02-15-preview"

5 - Run the agent
python main.py

