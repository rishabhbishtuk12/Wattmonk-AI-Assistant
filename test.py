from langchain_community.document_loaders import PyPDFLoader
from processing import chunker
from vectorstore import pinecone_openai
from processing import chunker



files = [
    "2017-NEC-Code.pdf"
]

all_docs = []

for file in files:
    docs = []
    loader = PyPDFLoader(file)
    for i, doc in enumerate(loader.lazy_load()):
        if "NEC" in file and i >= 150:
            break
        docs.append(doc)

    for doc in docs:

        if "NEC" in file:
            doc.metadata["source"] = "NEC"
            doc.metadata["type"] = "technical"
        else:
            doc.metadata["source"] = "Wattmonk"
            doc.metadata["type"] = "company"


        doc.metadata["file_name"] = file

    all_docs.extend(docs)


chunk = chunker.Chunk().chunking(all_docs)
print(doc)
vector_db = pinecone_openai.OpenAIVectorStore(chunk) 

