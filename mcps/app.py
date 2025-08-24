# app.py

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from portia import Config, LLMProvider, Portia, DefaultToolRegistry
from custom_tools.registry import custom_tool_registry
from formatter import generate

load_dotenv()

# === Portia config & instance ===
google_config = Config.from_default(
    llm_provider=LLMProvider.GOOGLE,
    default_model="google/gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
)

portia = Portia(
    config=google_config,
    tools=DefaultToolRegistry(config=google_config) + custom_tool_registry,
)

# === FastAPI setup ===
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Models ===
class ChatRequest(BaseModel):
    message: str
# === Chat endpoint with streaming ===
@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    user_query = req.message

    def event_stream():
        plan_run = portia.run(user_query)

        for event in plan_run:
            key, value = event  # <-- unpack tuple

            if key == "outputs":
                final_output = getattr(value, "final_output", None)
                if final_output:
                    # Send summary if available, else value
                    if getattr(final_output, "summary", None):
                        yield f"data: {final_output.summary}\n\n"
                    elif getattr(final_output, "value", None):
                        yield f"data: {final_output.value}\n\n"

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/")
async def root():
    return {"status": "✅ Portia AWS Agent is running!"}
