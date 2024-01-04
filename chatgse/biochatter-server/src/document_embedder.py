
from biochatter.vectorstore import DocumentEmbedder, DocumentReader
from typing import Any
import logging

from src.utils import get_connection_args, parse_api_key

logger = logging.getLogger(__name__)

def new_embedder_document(authKey: str, tmpFile: str, filename: str, rag_config: Any):
    api_key = parse_api_key(authKey)
    connection_args = get_connection_args()
    rag_agent = DocumentEmbedder(
      used=True,
      use_prompt=rag_config["useRAG"],
      chunk_size=rag_config["chunkSize"],
      chunk_overlap=rag_config["overlapSize"],
      split_by_characters=rag_config["splitByChar"],
      n_results=rag_config["resultNum"],
      api_key=api_key,      
      connection_args=connection_args
    )
    rag_agent.connect()
    logger.error(f'authKey: {authKey}, tmpFile: {tmpFile}, filename: {filename}, host: {connection_args["host"]}, port: {connection_args["port"]}')
    reader = DocumentReader()
    docs = reader.load_document(tmpFile)
    if len(docs) > 0:
        for doc in docs:
            doc.metadata.update({"source": filename})
    logger.info('save_document')
    logger.error('save_document')
    rag_agent.save_document(docs)
    
def get_all_documents(authKey: str):
    api_key = parse_api_key(authKey)
    connection_args = get_connection_args()
    rag_agent = DocumentEmbedder(
        api_key=api_key,
        connection_args=connection_args
    )
    rag_agent.connect()
    return rag_agent.get_all_documents()

def remove_document(docId: str, authKey: str):
    api_key = parse_api_key(authKey)
    connection_args = get_connection_args()
    rag_agent = DocumentEmbedder(
        api_key=api_key,
        connection_args=connection_args
    )
    rag_agent.connect()
    rag_agent.remove_document(doc_id=docId)

