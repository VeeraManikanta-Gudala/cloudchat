Portia AWS Agent

An AI-powered FastAPI backend + React frontend that acts as a natural language AWS assistant.
It uses Portia (planning agent framework) + Google Gemini LLM + custom AWS tools to perform tasks like creating, listing, and stopping EC2 instances — all via plain English queries.

Features

🔹 Natural Language AWS Control
Just type:

"create an EC2 instance" → launches a t2.micro (minimal billing by default).

"create a t3.medium instance in us-east-1" → launches a t3.medium.

"list all instances" → lists all your EC2 instances.

"stop all instances" → stops every running instance.

🔹 Default Cost-Saving
If no type/region is provided, defaults to t2.micro in us-east-1.

🔹 Robust Output Formatting
Responses are formatted into clean, readable text (via Gemini formatter) for easy copy-paste into terminals or docs.

🔹 Modern Tech Stack

Backend: FastAPI + Portia + Google Gemini

Frontend: React + TailwindCSS

Infra: Custom AWS Tools integrated with Portia



Example queries

"create an ec2 instance"

"createa s3 bucket named porita-s3-agent-new"
list all the buckets

delete the bucket <bucket name>

"create a t3.medium instance in ap-south-1"

"list all instances"

"stop all instances"
