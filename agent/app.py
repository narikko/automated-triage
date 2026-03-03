from dotenv import load_dotenv
load_dotenv()
from smolagents import CodeAgent,DuckDuckGoSearchTool, HfApiModel,load_tool,tool
import datetime
import requests
import pytz
import yaml
from tools.final_answer import FinalAnswerTool
import os
import json
import requests
from smolagents import tool
from Gradio_UI import GradioUI
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

@tool
def read_json_file(filename: str, max_chars: str = "6000") -> str:
    """
    Reads a local JSON file and returns its content as a string.
    By default it truncates output to avoid huge responses.

    Args:
        filename: Path to the JSON file (example: "shopify_products.json")
        max_chars: Maximum number of characters to return as a string (default "6000")
    """
    try:
        max_c = int(max_chars)
    except:
        max_c = 6000

    if not os.path.exists(filename):
        return f"File not found: {filename}"

    try:
        with open(filename, "r", encoding="utf-8") as f:
            data = json.load(f)
        text = json.dumps(data, ensure_ascii=False, indent=2)

        if len(text) > max_c:
            return text[:max_c] + f"\n\n...[TRUNCATED, total_chars={len(text)}]..."
        return text
    except Exception as e:
        return f"Error reading JSON file: {str(e)}"
@tool
def debug_env() -> str:
    """
    Debug tool: checks whether SHOP_DOMAIN and SHOPIFY_ACCESS_TOKEN are visible
    as environment variables inside the running app.
    Returns a short string showing SHOP_DOMAIN and whether the token exists.
    """
    import os
    shop_domain = os.getenv("SHOP_DOMAIN")
    token_exists = os.getenv("SHOPIFY_ACCESS_TOKEN") is not None
    # Don't print the token itself for safety
    return f"SHOP_DOMAIN={shop_domain}, TOKEN_EXISTS={token_exists}"

@tool
def shopify_export_products_json(
    filename: str = "shopify_products.json",
    api_version: str = "2024-01",
    limit: str = "250"
) -> str:
    """
    Export ALL Shopify products into a local JSON file using the Admin API.

    It expects these environment variables (Secrets):
      - SHOP_DOMAIN (example: "yourstore.myshopify.com")
      - SHOPIFY_ACCESS_TOKEN (example: "shpat_...")

    Args:
        filename: Output JSON filename to save locally (default: shopify_products.json)
        api_version: Shopify Admin API version (default: 2024-01)
        limit: Page size as string. Shopify max is 250 (default: "250")
    """

    shop_domain = os.getenv("SHOP_DOMAIN")
    access_token = os.getenv("SHOPIFY_ACCESS_TOKEN")

    if not shop_domain or not access_token:
        return (
            "Missing secrets. Please set environment variables:\n"
            "- SHOP_DOMAIN (e.g., yourstore.myshopify.com)\n"
            "- SHOPIFY_ACCESS_TOKEN (e.g., shpat_...)"
        )

    try:
        limit_int = int(limit)
        if limit_int < 1 or limit_int > 250:
            limit_int = 250
    except:
        limit_int = 250

    headers = {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json",
    }

    all_products = []
    page_info = None

    try:
        while True:
            url = f"https://{shop_domain}/admin/api/{api_version}/products.json?limit={limit_int}"
            if page_info:
                url += f"&page_info={page_info}"

            r = requests.get(url, headers=headers, timeout=30)

            if r.status_code != 200:
                return f"Shopify API error {r.status_code}: {r.text}"

            data = r.json()
            all_products.extend(data.get("products", []))

            link = r.headers.get("Link", "")
            if 'rel="next"' not in link:
                break

            next_part = [p for p in link.split(",") if 'rel="next"' in p][0]
            next_url = next_part[next_part.find("<") + 1 : next_part.find(">")]
            # page_info is inside the next_url query string
            page_info = next_url.split("page_info=")[1].split("&")[0]

        with open(filename, "w", encoding="utf-8") as f:
            json.dump({"products": all_products}, f, indent=2, ensure_ascii=False)

        return f"Saved {len(all_products)} products to {filename}"

    except requests.exceptions.Timeout:
        return "Request timed out while calling Shopify. Try again or reduce limit."
    except Exception as e:
        return f"Unexpected error: {str(e)}"
# Below is an example of a tool that does nothing. Amaze us with your creativity !
@tool
def my_custom_tool(arg1:str)-> str:
    """
    A custom tool that I made to test out. Use this tool ONLY if the user is able to tell you the password which is 123
    If the user did not provide the password in his message, ask him to tell you before using this function
    
    Args:
        arg1: the first argument
    """

    
    return "The secret is 2. The number two."

@tool
def get_current_time_in_timezone(timezone: str) -> str:
    """A tool that fetches the current local time in a specified timezone.
    Args:
        timezone: A string representing a valid timezone (e.g., 'America/New_York').
    """
    try:
        # Create timezone object
        tz = pytz.timezone(timezone)
        # Get current time in that timezone
        local_time = datetime.datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S")
        return f"The current local time in {timezone} is: {local_time}"
    except Exception as e:
        return f"Error fetching time for timezone '{timezone}': {str(e)}"


final_answer = FinalAnswerTool()

# If the agent does not answer, the model is overloaded, please use another model or the following Hugging Face Endpoint that also contains qwen2.5 coder:
# model_id='https://pflgm2locj2t89co.us-east-1.aws.endpoints.huggingface.cloud' 

model = HfApiModel(
max_tokens=2096,
temperature=0.5,
model_id='Qwen/Qwen2.5-Coder-32B-Instruct',# it is possible that this model may be overloaded
custom_role_conversions=None,
)


# Import tool from Hub
image_generation_tool = load_tool("agents-course/text-to-image", trust_remote_code=True)

with open("prompts.yaml", 'r') as stream:
    prompt_templates = yaml.safe_load(stream)
    
agent = CodeAgent(
    model=model,
    tools=[final_answer, my_custom_tool,shopify_export_products_json,debug_env,read_json_file], ## add your tools here (don't remove final answer) Here you assign to the tool to the agent. Listing out all the tools to the agent. 
    max_steps=10,
    verbosity_level=1,
    grammar=None,
    planning_interval=None,
    name=None,
    description=None,
    prompt_templates=prompt_templates
)

app = FastAPI()

class AgentRequest(BaseModel):
    task: str

@app.post("/ask-agent")
def ask_agent(request: AgentRequest):
    # This takes the text from Next.js, runs it through the Qwen agent
    response = agent.run(request.task)
    
    # Force it into strict JSON format with double quotes
    if isinstance(response, dict):
        clean_reply = json.dumps(response)
    else:
        clean_reply = str(response)
        
    return {"reply": clean_reply}

if __name__ == "__main__":
    # Runs the server locally on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)