from pinecone import Pinecone, ServerlessSpec
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
import os
from dotenv import load_dotenv
import time

load_dotenv()

pine_api = os.getenv("PINECONE_API_KEY")
openai_api = os.getenv("OPENAI_API_KEY")

pc = Pinecone(api_key=pine_api)

# stats = pc.Index("wattmonk-openai").describe_index_stats()
# print(stats)

class OpenAIVectorStore:

    def __init__(self, docs=None):

     
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-large",  
            openai_api_key=openai_api
        )

        self.index_name = "wattmonk-openai"

       
        if self.index_name not in pc.list_indexes().names():
            pc.create_index(
                name=self.index_name,
                dimension=3072,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
            print("Created OpenAI index")

     
        self.vectorstore = PineconeVectorStore(
            index_name=self.index_name,
            embedding=self.embeddings,
            pinecone_api_key=pine_api
        )

      
        if docs:
            self._upload_documents(docs)


    def _upload_documents(self, docs):

        batch_size = 10

        stats = pc.Index(self.index_name).describe_index_stats()

        existing = stats['namespaces'].get('__default__', {}).get('vector_count', 0)

        print(f" Resuming upload from index: {existing}")

        for i in range(existing, len(docs), batch_size):

            batch = docs[i:i + batch_size]

            ids = [
                f"{doc.metadata.get('file_name', 'file')}_{i+j}"
                for j, doc in enumerate(batch)
            ]

            self.vectorstore.add_documents(
                documents=batch,
                ids=ids
            )

            print(f"Uploaded batch {(i // batch_size) + 1}")

            time.sleep(1)

        print("Upload complete")
    
    def search(self, query, k=3):

        
        if isinstance(query, list):
            query = query[0]

        print(f"Searching: {query}")
        all_results = []
        try:
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
            # print(unique_docs)
            return unique_docs




        #     results = self.vectorstore.similarity_search_with_score(query, k=k)

        #     if not results:
        #         print("No results found")
        #         return []

        #     docs = []
        #     seen = set()

        #     for doc, score in results:
        #         if score < 0.4:  
        #             if doc.page_content not in seen:
        #                 docs.append(doc)
        #                 seen.add(doc.page_content)

        #     print(f"Final docs: {len(docs)}")

        #     return docs

        except Exception as e:
            print("Search Error:", str(e))
            return []
        

