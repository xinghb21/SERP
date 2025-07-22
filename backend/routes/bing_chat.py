from flask import Flask, request, jsonify
from langchain_community.agent_toolkits.load_tools import load_tools
import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from langchain_community.utilities import SerpAPIWrapper

SERPAPI_KEY = "6175c3d4e24c3b4abf9b912a8506ed1afae4da748ac623072d666a1e9080a363"
os.environ["SERPAPI_API_KEY"] = SERPAPI_KEY
tools = load_tools(["serpapi"])

serpapiWrapper = SerpAPIWrapper(
    serpapi_api_key = SERPAPI_KEY,
    params={
        "engine": "bing",
        "cc": "US",
        "safeSearch": "strict",
    }
)
tools[0].func = serpapiWrapper.run
llm = ChatOpenAI(
    base_url = "https://api.gpt.ge/v1",
    api_key = "sk-Rl5dEkRmBQzqITvQ84AfE1FaF8F74c5c93113a0a78F9AbEf",
    model = "gpt-4o"
)

memory = MemorySaver()
agent = create_react_agent(llm, tools=tools, checkpointer=memory)

app = Flask(__name__)
def generate_reply(user_message, thread_id):
    # reply = f"AI 回复：这是对 “{user_message}” 的回答（模拟）。"
    # related = ['你可以问它定义', '深入了解原理', '实际应用场景']
    # return {"reply": reply, "related": related}
    config = {"configurable": {"thread_id": thread_id}}
    input_message = {
        "role": "user",
        "content": user_message
    }
    response = agent.invoke({'messages': [input_message]}, config)
    reply = response['messages'][-1].content
    related = ['你可以问它定义', '深入了解原理', '实际应用场景']
    return {"reply": reply, "related": related}

@app.route('/bing_chat', methods=['POST'])
def generate_reply_route():
    data = request.get_json()
    user_message = data.get("message", "")
    thread_id = data.get("thread_id", {})
    result = generate_reply(user_message, thread_id)
    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)