import json
from typing import Optional, Any, List
from flask import Flask, request
from dotenv import load_dotenv
import atexit
from src.conversation_manager import (
    chat,
    has_conversation, 
    initialize_conversation
)
import logging

from src.document_embedder import (
    get_all_documents, 
    new_embedder_document,
    remove_document
)
from src.utils import get_auth

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

load_dotenv()
cease_event = run_scheduled_job_continuously()
def onExit():
    cease_event.set()
atexit.register(onExit)

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
    print("[post] completions")
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
        return {"choices": [{"index": 0, "message": {"role": "assistant", "content": msg}, "finish_reason": "stop"}], "usage": usage}
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
        return {"status": "OK"}
    except Exception as e:
        return {"error": str(e)}
    
@app.route('/v1/rag/alldocuments', methods=['GET'])
def getAllDocuments():
    def post_process(docs: List[Any]):
        for doc in docs:
            doc['id'] = str(doc['id'])
        return docs
    auth = get_auth(request)
    try:
        docs = get_all_documents(auth)
        docs = post_process(docs)
        return {"documents": docs, "status": "OK"}
    except Exception as e:
        return {"error": str(e)}
    
@app.route('/v1/rag/document', methods=['DELETE'])
def removeDocument():
    jsonBody = request.json
    auth = get_auth(request)
    docId = get_params_from_json_body(jsonBody, 'docId', '')
    if len(docId) == 0:
        return {"error": "Failed to find document"}
    try:
        remove_document(docId, authKey=auth)
        return {"status": "OK"}
    except Exception as e:
        return {"error": str(e)}
    
    


