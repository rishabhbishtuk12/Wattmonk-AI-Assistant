# Wattmonk AI Assistant

A Retrieval-Augmented Generation (RAG) chatbot built to answer questions from domain-specific knowledge sources like the **NEC electrical code** and **Wattmonk documents**, while also handling broader queries through a general LLM fallback.

---

<video controls src="Screen-Recording.mp4" title="
"></video>

## Live Demo

Deployed Link: [Paste your deployed link here](#)

---

## Overview

Wattmonk AI Assistant is designed to provide accurate, context-aware answers by combining **semantic retrieval** with **LLM-based response generation**.

Instead of relying only on a language model, the system first searches relevant documents, retrieves the most useful context, and then generates an answer grounded in that information. If no meaningful context is found, it falls back to a general-purpose response flow.

This makes the assistant more reliable, more explainable, and better suited for real-world question answering.

---

## Features

- Context-aware answers using a RAG pipeline
- Semantic document retrieval with vector embeddings
- Support for NEC and Wattmonk knowledge sources
- Source-aware responses with document references
- General fallback responses when context is unavailable
- Short-term conversation memory using chat history
- FastAPI backend for real-time query handling
- Clean frontend flow for chat, summaries, and information pages

---

## How It Works

```text
User Query
   ↓
Query Expansion
   ↓
Vector Search
   ↓
Relevant Context Retrieval
   ↓
LLM Response Generation
   ↓
Answer with Sources
```

The assistant processes each question in multiple stages:

1. The user sends a query.
2. The system expands or reformulates the query for better retrieval.
3. The vector database searches for the most relevant document chunks.
4. The retrieved context is passed into the language model.
5. A grounded response is returned, along with useful source information.
6. If no relevant context is found, the assistant falls back to a general response path.

---

## Tech Stack

### Backend

- FastAPI

### Language Model

- OpenAI `gpt-4o-mini`

### Embeddings

- OpenAI `text-embedding-3-large`

### Vector Database

- Pinecone

### Frameworks and Libraries

- LangChain
- LangChain OpenAI
- LangChain Pinecone
- PyPDF
- Python Dotenv

### Data Sources

- NEC PDF documents
- Wattmonk PDF documents

---

## Project Structure

```bash
Wattmonk-AI-Assistant/
├── main.py
├── llm/
│   └── generator.py
├── vectorstore/
│   ├── pinecone_db.py
│   └── pinecone_openai.py
├── processing/
│   └── chunker.py
├── utils/
│   ├── helpers.py
│   └── Rishabh.jpeg
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── .env
├── 2017-NEC-Code.pdf
└── Wattmonk-Information.pdf
```

---

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-link>
cd Wattmonk-AI-Assistant
```

### 2. Install backend dependencies

```bash
pip install openai pinecone langchain langchain-openai langchain-pinecone langchain-community pypdf python-dotenv fastapi uvicorn
```

### 3. Create a `.env` file

```env
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
```

### 4. Run the backend

```bash
uvicorn main:app --reload
```

Backend will start at:

```bash
http://127.0.0.1:8000
```

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will start at:

```bash
http://localhost:5173
```

---

## API Example

### Request

```json
{
  "message": "Explain NEC grounding basics",
  "chat_history": []
}
```

### Response

```json
{
  "reply": "Grounding in NEC ensures safety by...",
  "source": "NEC",
  "sources": [
    {
      "title": "2017-NEC-Code.pdf",
      "page": 50,
      "snippet": "Grounding requirements..."
    }
  ],
  "chat_history": []
}
```

---

## Challenges and Improvements

Building the project involved several important design and engineering decisions.

### Embedding Consistency

Using different embedding models for indexing and retrieval can produce weak or irrelevant matches. The solution was to keep embedding usage consistent and structure the vector setup more carefully.

### Retrieval Performance

Expanding one question into multiple search queries improved coverage, but also introduced extra latency. Retrieval strategy was refined to reduce unnecessary search overhead and improve response speed.

### Context Formatting

Passing raw retrieved objects directly into the response pipeline made answer generation unreliable. A cleaner text-based context format improved response quality significantly.

### Structured Output Handling

Response parsing had to be made more stable to avoid failures when the model returned text in an unexpected format.

### Conversation Continuity

Because language models are stateless by default, chat history handling was added to preserve context across turns.

### Fallback Logic

A dedicated fallback path was important for cases where the knowledge base did not contain enough relevant information.

---

## Frontend Experience

The frontend is built around a focused multi-page interface with:

- Chat page
- Chat summary page
- NEC information page
- Wattmonk information page
- About page

The UI is designed to be lightweight, responsive, and easy to navigate, with a clear emphasis on readability and interaction.

---

## Future Scope

- Streaming responses
- Hybrid search
- Better citation formatting
- Confidence scoring
- Improved deployment pipeline
- Extended document coverage
- Advanced conversation memory

---

## Why This Project Matters

This project shows how document retrieval and language models can work together to build a more dependable assistant.

It is not just about generating answers. It is about generating answers that are:

- relevant
- grounded
- traceable
- useful in practical workflows

---

## Author

**Rishabh Bisht**

- Email: `rishabhbisht.uk12@gmail.com`
- LinkedIn: https://www.linkedin.com/in/rishabh-bisht-uk12/
- GitHub: https://github.com/rishabhbishtuk12

---
