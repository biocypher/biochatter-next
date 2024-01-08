import json
from typing import Optional, Any, List
from flask import Flask, request
from dotenv import load_dotenv
import atexit
import logging

from pymilvus import MilvusException
import pymilvus
from src.constants import ERROR_MILVUS_CONNECT_FAILED, ERROR_MILVUS_UNKNOWN, ERROR_OK, ERROR_UNKNOW, ERRSTR_MILVUS_CONNECT_FAILED
from src.conversation_manager import (
    chat,
    has_conversation, 
    initialize_conversation
)

from src.document_embedder import (
    get_all_documents,
    get_connection_status, 
    new_embedder_document,
    remove_document
)
from src.utils import get_auth

# prepare logger
logging.basicConfig(level=logging.INFO)
file_handler = logging.FileHandler("./logs/app.log")
file_handler.setLevel(logging.INFO)
stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.INFO)
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt="%Y-%m-%d %H:%M:%S"
)
file_handler.setFormatter(formatter)
stream_handler.setFormatter(formatter)
root_logger = logging.getLogger()
root_logger.addHandler(file_handler)
root_logger.addHandler(stream_handler)

from src.job_recycle_conversations import run_scheduled_job_continuously

# run scheduled job: recycle unused session
cease_event = run_scheduled_job_continuously()
def onExit():
    cease_event.set()
atexit.register(onExit)

load_dotenv()
app = Flask(__name__)

DEFAULT_RAGCONFIG = {
    "useRAG": False,
    "splitByChar": True,
    "chunkSize": 1000,
    "overlapSize": 0,
    "selectedDocIds": [], 
    "resultNum": 3
}

def get_params_from_json_body(json: Optional[Any], name: str, defaultVal: Optional[Any]) -> Optional[Any]:
    if not json:
        return defaultVal
    if name in json:
        return json[name]
    return defaultVal

@app.route('/v1/chat/completions', methods=['POST'])
def handle():
    auth = get_auth(request)
    jsonBody = request.json
    sessionId = get_params_from_json_body(jsonBody, "session_id", defaultVal="")
    messages = get_params_from_json_body(jsonBody, "messages", defaultVal=[])
    model = get_params_from_json_body(jsonBody, "model", defaultVal="gpt-3.5-turbo")
    temperature = get_params_from_json_body(jsonBody, "temperature", defaultVal=0.7)
    presence_penalty = get_params_from_json_body(jsonBody, "presence_penalty", defaultVal=0)
    frequency_penalty = get_params_from_json_body(jsonBody, "frequency_penalty", defaultVal=0)
    top_p = get_params_from_json_body(jsonBody, "top_p", defaultVal=1)
    ragConfig = get_params_from_json_body(jsonBody, "ragConfig", defaultVal=DEFAULT_RAGCONFIG)

    if not has_conversation(sessionId):
        initialize_conversation(
            sessionId=sessionId,
            modelConfig={
                "temperature": temperature,
                "presence_penalty": presence_penalty,
                "frequency_penalty": frequency_penalty,
                "top_p": top_p,
                "model": model,
                "auth": auth
            }
        )
    try:
        (msg, usage) = chat(sessionId, messages, auth, ragConfig)
        return {"choices": [{"index": 0, "message": {"role": "assistant", "content": msg}, "finish_reason": "stop"}], "usage": usage, "code": ERROR_OK}
    except MilvusException as e:
        if e.code == pymilvus.Status.CONNECT_FAILED:
            return {"error": ERRSTR_MILVUS_CONNECT_FAILED, "code": ERROR_MILVUS_CONNECT_FAILED}
        else:
            return {"error": e.message, "code": ERROR_MILVUS_UNKNOWN}
    except Exception as e:
        return {"error": str(e)}

@app.route('/v1/rag/newdocument', methods=['POST'])
def newDocument():
    jsonBody = request.json
    tmpFile = get_params_from_json_body(jsonBody, 'tmpFile', '')
    filename = get_params_from_json_body(jsonBody, 'filename', '')
    ragConfig = get_params_from_json_body(jsonBody, 'ragConfig', DEFAULT_RAGCONFIG)
    if type(ragConfig) is str:
        ragConfig = json.loads(ragConfig)
    auth = get_auth(request)
    # TODO: consider to be compatible with XinferenceDocumentEmbedder
    try:
        new_embedder_document(authKey=auth,tmpFile=tmpFile, filename=filename, rag_config=ragConfig)
        return {"status": "OK", "code": ERROR_OK}
    except MilvusException as e:
        if e.code == pymilvus.Status.CONNECT_FAILED:
            return {"error": ERRSTR_MILVUS_CONNECT_FAILED, "code": ERROR_MILVUS_CONNECT_FAILED}
        else:
            return {"error": e.message, "code": ERROR_MILVUS_UNKNOWN}
    except Exception as e:
        return {"error": str(e), "code": ERROR_UNKNOW}
    
@app.route('/v1/rag/alldocuments', methods=['POST'])
def getAllDocuments():
    def post_process(docs: List[Any]):
        for doc in docs:
            doc['id'] = str(doc['id'])
        return docs
    auth = get_auth(request)
    jsonBody = request.json
    connection_args = get_params_from_json_body(jsonBody, "connectionArgs", {})
    try:
        docs = get_all_documents(auth, connection_args)
        docs = post_process(docs)
        return {"documents": docs, "status": "OK", "code": ERROR_OK}
    except MilvusException as e:
        if e.code == pymilvus.Status.CONNECT_FAILED:
            return {"error": ERRSTR_MILVUS_CONNECT_FAILED, "code": ERROR_MILVUS_CONNECT_FAILED}
        else:
            return {"error": e.message, "code": ERROR_MILVUS_UNKNOWN}
    except Exception as e:
        return {"error": str(e), "code": ERROR_UNKNOW}
    
@app.route('/v1/rag/document', methods=['DELETE'])
def removeDocument():
    jsonBody = request.json
    auth = get_auth(request)
    docId = get_params_from_json_body(jsonBody, 'docId', '')
    connection_args = get_params_from_json_body(jsonBody, "connectionArgs", {})
    if len(docId) == 0:
        return {"error": "Failed to find document"}
    try:
        remove_document(docId, authKey=auth, connection_args=connection_args)
        return {"status": "OK", "code": ERROR_OK}
    except MilvusException as e:
        if e.code == pymilvus.Status.CONNECT_FAILED:
            return {"error": ERRSTR_MILVUS_CONNECT_FAILED, "code": ERROR_MILVUS_CONNECT_FAILED}
        else:
            return {"error": e.message, "code": ERROR_MILVUS_UNKNOWN}
    except Exception as e:
        return {"error": str(e), "code": ERROR_UNKNOW}
    
@app.route('/v1/rag/connectionstatus', methods=['POST'])
def getConnectionStatus():
    try:
        auth = get_auth(request)
        jsonBody = request.json
        connection_args = get_params_from_json_body(jsonBody, "connectionArgs", {})    
        connected = get_connection_status(connection_args, auth)
        return {"status": "connected" if connected else "disconnected", "code": ERROR_OK}
    except MilvusException as e:
        return {"error": e.message, "code": ERROR_MILVUS_UNKNOWN}
    except Exception as e:
        return {"error": str(e), "code": ERROR_UNKNOW}
    
    


