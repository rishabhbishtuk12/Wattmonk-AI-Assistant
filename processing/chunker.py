from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

class Chunk:
    def chunking(self, all_docs):
        text_splitter =  RecursiveCharacterTextSplitter(
            chunk_size=300, 
            chunk_overlap=50
        )
        docs = text_splitter.split_documents(all_docs)

        return docs