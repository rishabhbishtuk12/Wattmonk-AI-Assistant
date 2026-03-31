from fastapi import FastAPI
from urllib.parse import urlparse, parse_qs
from vectorstore import pinecone_db
from llm import generator
from fastapi.middleware.cors import CORSMiddleware
import json
from vectorstore import pinecone_db
from vectorstore import pinecone_openai

from llm import generator
from pydantic import BaseModel

def format_context(chunks):
    texts = []

    for doc in chunks:
        text = f"""
Source: {doc.metadata.get("source")}
Page: {doc.metadata.get("page")}

{doc.page_content}
"""
        texts.append(text)

    return "\n\n".join(texts)




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
    
class ChatSummary(BaseModel):
    prompt: str
    Chat_history2: list = []

# print(data.message)

@app.post("/chat")
def ask_question(data: ChatRequest):

    query = data.message
    chat_history =  data.chat_history
    if data.chat_history != llm.chat_history:
        llm.chat_history = data.chat_history

    queries = llm.Query(query)
    print("queries:"  ,queries)

    chunks = vector_db.search(queries, 5)
        # print(chunks)
    chunk = format_context(chunks)
    print(chunk)
    answer = generator.UserQuestion(chunk, query, chat_history[-5:] )
        
    print(answer)
       
    if answer['relevant'] == "No":
        output = llm.generalQuery(query)
        return {
                "reply": output["reply"],
                "source": output["source"],
                "chat_history": llm.chat_history
                 }
    return {
            "reply": answer.get("reply"),
            "source": answer["source"],
            "sources": answer["sources"],
            "chat_history": llm.chat_history
        }

@app.post("/chat-summary")
def summary(data: ChatSummary):
    message = data.prompt
    Chat_history = data.Chat_history2
    output = llm.summary(message, Chat_history)
    return output


# @app.get("/languages")
# def get_languages():
#     return


# @app.post("/summary")
# def get_summary(data: SummaryRequest):
#     try:
#         # text = video_store.get(data.video_id, "")

#         # if not text:
#             # return {"summary": "No data found"}

#         # simple summary (replace later with AI)
#         return {
            
#             
#             # "summary": text[:500] + "..."
#         }

#     except Exception as e:
#         return {"summary": str(e)}

# while True:
#     search = input(":")
#     queries = generator.LLM().Query(search)
#     revelent = pinecone_db.VectorStore().search(queries,3)
#     answer = generator.LLM().UserQuestion(revelent, search )
#     print(answer)
#     if answer['relevant'] == "No":
#                 output = generator.LLM().generalQuery(search)
#                 print(output)
   
    

    # if len(arr) == 0:
    #     output = generator.LLM().generalQuery(search)
    #     print(output)
    # else:
    #     queries = generator.LLM().Query(search)
    #     print(queries)
    #     revelent = pinecone_db.VectorStore().search(queries,3)
    #     print(revelent)

    #     if revelent:
            
    #         answer = generator.LLM().UserQuestion(revelent, search )
    #         print(answer)

    #         if answer['relevant'] == "No":
    #             output = generator.LLM().generalQuery(search)
    #             print(output)
                
    #     else:
    #         output = generator.LLM().generalQuery(search)
    #         print(output)

    # qdrant_store.VectorStore().add_documents(doc)

    # while True:
    #     query = input("what is the query : ")
    #     queries = generator.LLM().Query(query)
    #     relevant_chunks = qdrant_store.VectorStore().search(queries, video_id, 3)
    #     answer = generator.LLM().UserQuestion(relevant_chunks, query )
    #     print(answer)
