# main.py

import os
from langchain_openai import AzureChatOpenAI
from langgraph.graph import StateGraph, add_edges
import requests

# Load Azure OpenAI environment variables
# Make sure to set these in your system or .env file
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_API_BASE = os.getenv("OPENAI_API_BASE")
OPENAI_API_TYPE = os.getenv("OPENAI_API_TYPE", "azure")
OPENAI_API_VERSION = os.getenv("OPENAI_API_VERSION", "2024-02-15-preview")
DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT")

# Create Azure OpenAI client
llm = AzureChatOpenAI(
    azure_deployment=DEPLOYMENT_NAME,
    temperature=0.2
)

# Planner node: breaks goal into steps
def planner_node(state):
    user_goal = state["goal"]
    plan = llm.invoke(
        f"You are a retail workflow assistant. Break down this goal into clear steps: '{user_goal}'"
    )
    return {"plan": plan.content}

# Executor node: perform mock or real API calls
def executor_node(state):
    plan = state["plan"]
    print(f"Executing plan: {plan}")
    # Example API call (replace with your real API)
    # response = requests.post("https://api.example.com/order", json={"plan": plan})
    # return {"result": response.json()}
    return {"result": f"Mock execution done for: {plan}"}

# Build LangGraph workflow
graph = StateGraph()
graph.add_node("planner", planner_node)
graph.add_node("executor", executor_node)

add_edges(graph, [
    ("planner", "executor")
])

graph.set_entry_point("planner")
graph.set_finish_point("executor")

workflow = graph.compile()

if __name__ == "__main__":
    result = workflow.invoke({
        "goal": "Restock low inventory items for all stores"
    })
    print(f"Workflow result: {result}")
