from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from vectorstore import pinecone_db
from vectorstore import pinecone_openai
from llm import generator

app = FastAPI(title="Wattmonk AI Assistant")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


vector_db = pinecone_openai.OpenAIVectorStore()
llm = generator.LLM()



class ChatRequest(BaseModel):
    message: str
    chat_history: list = []



@app.post("/chat")
def ask_question(data: ChatRequest):

    try:
        query = data.message
        print(f"🔹 Query: {query}")


        if data.chat_history:
            llm.chat_history = data.chat_history

        queries = llm.Query(query)
        print("🔹 Queries:", queries)


        main_query = queries[0]


        chunks = vector_db.search(main_query, 3)
        print(f"🔹 Chunks found: {len(chunks)}")


        if chunks:

      
            context = "\n\n".join([doc.page_content for doc in chunks])

            output = llm.UserQuestion(context, query)
            print("🔹 RAG output:", output)

            return {
                "reply": output.get("reply") or output.get("answer") or str(output),
                "source": chunks[0].metadata.get("source", "database"),
                "sources": [
                    {
                        "title": doc.metadata.get("file_name"),
                        "page": doc.metadata.get("page"),
                        "snippet": doc.page_content[:120]
                    }
                    for doc in chunks
                ],
                "chat_history": llm.chat_history
            }


        print("⚠️ No relevant docs → fallback")

        output = llm.generalQuery(query)

        return {
            "reply": output.get("reply") or output.get("answer") or str(output),
            "source": "general",
            "sources": [],
            "chat_history": llm.chat_history
        }

    except Exception as e:
        print("❌ ERROR:", str(e))
        return {
            "reply": "Something went wrong",
            "error": str(e)
        }