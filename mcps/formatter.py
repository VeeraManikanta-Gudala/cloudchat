# To run this code you need to install the following dependencies:
# pip install google-genai
# formatter.py
import base64
import os
from google import genai
from google.genai import types

def generate(user_input):
    client = genai.Client(
        api_key=os.environ.get("GOOGLE_API_KEY"),
    )

    model = "gemini-2.5-flash-lite"

    # Persistent system context
    system_prompt = """
You are a Cloud Formatter AI.

Role:
1. Convert user natural language requests into clear AWS resource instructions for the system (lowest billing option if unspecified).
2. Convert system JSON responses back into clear, human-friendly summaries.
3. Always suggest useful next steps (e.g., SSH command, installing web server, permissions).
4. Always respect user-specified details (instance type, region, etc).

Output format:
- When user asks → respond in AWS terms clearly for the system.
- When system replies (JSON/structured) → translate to friendly explanation with actionable steps.
"""

    contents = [
        types.Content(
            role="user",content="you are a formatter",
            parts=[types.Part.from_text(text=system_prompt)],
        ),
        types.Content(
            role="user",content=user_input,
            parts=[types.Part.from_text(text=user_input)],
        ),
    ]

    tools = [types.Tool(googleSearch=types.GoogleSearch())]

    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0),
        tools=tools,
    )

    final_text = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        if chunk.text:
            print(chunk.text, end="", flush=True)
            final_text += chunk.text

    return final_text
