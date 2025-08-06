from flask import Flask, request, Response
import os, json

from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import StateGraph, END, START
from typing_extensions import TypedDict
from typing import Annotated
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_community.agent_toolkits.load_tools import load_tools

from langchain_openai import ChatOpenAI
from langchain_community.utilities import SerpAPIWrapper
from langgraph.checkpoint.memory import InMemorySaver

from related_schemas import Related

memory = InMemorySaver()

class State(TypedDict):
    messages: Annotated[list, add_messages]

graph_builder = StateGraph(State)

SERPAPI_KEY = "6175c3d4e24c3b4abf9b912a8506ed1afae4da748ac623072d666a1e9080a363"
os.environ["SERPAPI_API_KEY"] = SERPAPI_KEY
tools = load_tools(["serpapi"])

serpapiWrapper = SerpAPIWrapper(
    serpapi_api_key = SERPAPI_KEY,
    params={
        "engine": "google",
        "cc": "US",
        "safeSearch": "strict",
        "json_restrictor": "organic_results[0:3].{link, favicon, snippet, source, title}",
    }
)
tools[0].func = serpapiWrapper.run

class ToolCallContext:
    def __init__(self):
        self.tool_called = False
        self.related_list = []

llm = ChatOpenAI(
    base_url = "https://api.gpt.ge/v1",
    api_key = "sk-Rl5dEkRmBQzqITvQ84AfE1FaF8F74c5c93113a0a78F9AbEf",
    model = "gpt-4o"
)

llm_with_tools = llm.bind_tools(tools)

def chatbot(state: State):
    return {"messages": [llm_with_tools.invoke(state["messages"])]}

graph_builder.add_node("chatbot", chatbot)

tool_node = ToolNode(tools=tools)
graph_builder.add_node("tools", tool_node)

graph_builder.add_conditional_edges(
    "chatbot",
    tools_condition,
)

graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")
graph = graph_builder.compile(checkpointer=memory)

app = Flask(__name__)


def generate_reply(user_message, thread_id, ctx: ToolCallContext):
    config = {"configurable": {"thread_id": thread_id}}
    input_messages = [
        {
            "role": "system",
            "content": "你是一个聪明、耐心、专业但语气亲切的中文 AI 助手，擅长用清晰、结构化、自然的语言解释复杂的问题。你的目标是帮助用户理解问题、完成任务，并提供详实的回答，而不是简单给出短答案。如果用户提问不够明确，你可以礼貌地引导用户补充更多信息。你可以使用简洁的小标题或编号帮助用户理解内容，但不要啰嗦或显得高高在上。你应该尽量提供实用、详细、有逻辑的回答。如果你不知道答案，请诚实地告诉用户。"
        },
        {
            "role": "user",
            "content": user_message
        }
    ]

    for step, metadata in graph.stream({'messages': input_messages}, config, stream_mode="messages"):
        if metadata["langgraph_node"] == "chatbot" and (text := step.text()):
            yield 'data: ' + json.dumps({"reply": text or "", "related": []}) + '\n\n'
        elif metadata["langgraph_node"] == "tools":
            ctx.tool_called = True

# 路由接口
@app.route('/bing_chat', methods=['POST'])
def generate_reply_route():

    data = request.get_json()
    user_message = data.get("message", "")
    thread_id = data.get("thread_id", "thread-default")

    def stream_response():
        ctx = ToolCallContext()

        # 初始化响应
        yield 'data: ' + json.dumps({"reply": "", "related": []}) + '\n\n'

        # 逐步返回流式数据
        yield from generate_reply(user_message, thread_id, ctx)

        if ctx.tool_called:
            # print(serpapiWrapper.result['organic_results'])
            for result in serpapiWrapper.result['organic_results']:
                ctx.related_list.append(Related(**result))
        # 返回推荐结果
        related_data = [
            {"title": related.title, "link": str(related.link), "favicon": str(related.favicon), "source": related.source}
            for related in ctx.related_list
        ]
        # print(related_data)
        yield 'data: ' + json.dumps({"reply": "", "related": related_data}, ensure_ascii=False) + '\n\n'

    return Response(stream_response(), content_type='text/event-stream')

# 启动服务
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)