from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import time
from langchain_pinecone import PineconeVectorStore
import os
from dotenv import load_dotenv

load_dotenv()
pine_api = os.getenv("PINECONE_API_KEY")
pc = Pinecone(api_key= pine_api)


class VectorStore:

    def __init__(self):

        self.embedding_api = os.getenv("GOOGLE_API_KEY")


        self.embeddings = GoogleGenerativeAIEmbeddings(
             model="gemini-embedding-001", 
             google_api_key = self.embedding_api
             )
        # vector_docs = embeddings.embed_documents(docs)
        # pc.delete_index("wattmonk-rag-chatbot")
        if "wattmonk-rag-chatbot" not in pc.list_indexes().names():
            pc.create_index(
                name="wattmonk-rag-chatbot",
                dimension=3072,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                    )
            )
        self.index= pc.Index("wattmonk-rag-chatbot")

        self.vectorstore = PineconeVectorStore(
            index_name="wattmonk-rag-chatbot",
            embedding=self.embeddings,
            pinecone_api_key=pine_api
        )

        # batch_size = 5
        # start = 700
        # for i in range(start, len(docs), batch_size):
        #     batch = docs[i:i + batch_size]

        #     self.vectorstore.add_documents(batch)

        #     print(f"Uploaded batch {i//batch_size + 1}")

        #     time.sleep(3)   # avoid rate limit

    def search(self, query, k = 3):
        print("i am here")
        # if isinstance(query, list):
        #     query = [query]

        all_results = []
        print("i am here")
        for q in query:
            print(q)
            retriever = self.vectorstore.similarity_search(q, k)
            print(retriever)
            all_results.extend(retriever)

        print("i am here")
        unique_docs = []
        seen = set()
        print("i am here")
        for doc in all_results:
            if doc.page_content not in seen:
                unique_docs.append(doc)
                seen.add(doc.page_content)
        print(unique_docs)
        return unique_docs
