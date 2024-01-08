import os
from datetime import datetime
import logging
from typing import Optional, Dict, List, Any
from biochatter.llm_connect import (
    AzureGptConversation, 
    GptConversation, 
    Conversation
)
from biochatter.vectorstore import DocumentEmbedder
from pprint import pprint
import threading
from threading import RLock
from src.constants import (
    OPENAI_API_BASE,
    OPENAI_API_KEY,
    OPENAI_API_TYPE,
    OPENAI_API_VERSION,
    OPENAI_DEPLOYMENT_NAME,
    OPENAI_MODEL
)
from src.utils import get_rag_agent_prompts, parse_api_key

logger = logging.getLogger(__name__)

rlock = RLock()

defaultModelConfig = {
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000,
    "presence_penalty": 0,
    "frequency_penalty": 0,
    "sendMemory": True,
    "historyMessageCount": 4,
    "compressMessageLengthThreshold": 2000,
}

MAX_AGE = 3*24*3600*1000 # 3 days

class SessionData:
    def __init__(self, sessionId: str, modelConfig: Dict, chatter: Optional[GptConversation]):
        self.modelConfig = modelConfig
        self.chatter: Optional[GptConversation] = chatter
        self.sessionId = sessionId

        self.createdAt = int(datetime.now().timestamp()*1000) # in milliseconds
        self.refreshedAt = self.createdAt
        self.maxAge =  MAX_AGE

    def chat(self, messages: List[str], authKey: str, ragConfig: dict):
        if self.chatter is None:
            return
        if not messages or len(messages) == 0:
            return
        api_key = authKey
        if not isinstance(self.chatter, AzureGptConversation): # chatter is instance of GptConversation
            import openai
            if not openai.api_key or not hasattr(self.chatter, "chat"):
                if not authKey:
                    return False
                self.chatter.set_api_key(api_key, self.sessionId)
        
        # update rag_agent
        self.chatter.rag_agent = DocumentEmbedder(
            used=True,
            use_prompt=ragConfig["useRAG"],
            chunk_size=ragConfig["chunkSize"],
            chunk_overlap=ragConfig["overlapSize"],
            split_by_characters=ragConfig["splitByChar"],
            n_results=ragConfig["resultNum"],
            api_key=api_key,
            connection_args=ragConfig["connectionArgs"]
        )
        if ragConfig["useRAG"]:
            self.chatter.rag_agent.connect()
        
        text = messages[-1]["content"]
        messages = messages[:-1]
        # pprint(messages)
        self._setup_messages(messages)
        try:
            (msg, usage, _) = self.chatter.query(text)
            return (msg, usage)
        except Exception as e:
            logger.error(e)
            raise e
    
    def _setup_messages(self, openai_msgs: List[Any]):
        if self.chatter is None:
            return False
        self.chatter.messages = []
        for msg in openai_msgs:
            if msg["role"] == "system":
                self.chatter.append_system_message(msg["content"])
            elif msg["role"] == "assistant":
                self.chatter.append_ai_message(msg["content"])
            elif msg["role"] == "user":
                self.chatter.append_user_message(msg["content"])

conversationsDict = {}

def initialize_conversation(sessionId: str, modelConfig: dict):
    rlock.acquire()
    try:
        if OPENAI_API_TYPE in os.environ and os.environ[OPENAI_API_TYPE] == "azure":
            logger.info(f"create AzureGptConversation session data for {sessionId} and initialize")
            chatter = AzureGptConversation(
                deployment_name=os.environ[OPENAI_DEPLOYMENT_NAME],
                model_name=os.environ[OPENAI_MODEL],
                prompts={"rag_agent_prompts": get_rag_agent_prompts()},
                version=os.environ[OPENAI_API_VERSION],
                base=os.environ[OPENAI_API_BASE],
            )
            chatter.set_api_key(os.environ[OPENAI_API_KEY])
            conversationsDict[sessionId] = SessionData( sessionId, modelConfig, chatter)
        else:
            logger.info(f"create GptConversation session data for {sessionId} and initialize")
            chatter = GptConversation("gpt-3.5-turbo", prompts={"rag_agent_prompts": get_rag_agent_prompts()})
            conversationsDict[sessionId] = SessionData(
                sessionId=sessionId,
                modelConfig=modelConfig,
                chatter=chatter
            )
    except Exception as e:
        logger.error(e)
        raise e
    finally:
        rlock.release()
def has_conversation(sessionId: str) -> bool:
    rlock.acquire()
    try: 
        return sessionId in conversationsDict
    finally:
        rlock.release()
def get_conversation(sessionId: str) -> Optional[SessionData]:
    rlock.acquire()
    try:
        if not sessionId in conversationsDict:
            initialize_conversation(sessionId, defaultModelConfig.copy())
        return conversationsDict[sessionId]
    except Exception as e:
        logger.error(e)
        raise e
    finally:
        rlock.release()

    
def remove_conversation(sessionId: str):
    rlock.acquire()
    try:
        if not sessionId in conversationsDict:
            return
        del conversationsDict[sessionId]
    except Exception as e:
        logger.error(e)
    finally:
        rlock.release()

def chat(sessionId: str, messages: List[str], authKey: str, ragConfig: dict):
    rlock.acquire()
    try:
        conversation = get_conversation(sessionId=sessionId)
        logger.info(f"get conversation for session id {sessionId}, type of conversation is SessionData {isinstance(conversation, SessionData)}")
        return conversation.chat(messages=messages, authKey=authKey, ragConfig=ragConfig)
    except Exception as e:
        logger.error(e)
        raise e
    finally:
        rlock.release()

def recycle_conversations():
    logger.info(f"[recycle] - {threading.get_native_id()} recycle_conversation")
    rlock.acquire()
    now = datetime.now().timestamp() * 1000 # in milliseconds
    sessionsToRemove: List[str] = []
    try:
        for sessionId in conversationsDict.keys():
            conversation = get_conversation(sessionId=sessionId)
            assert conversation is not None
            logger.info(f"[recycle] sessionId is {sessionId}, refreshAt: {conversation.refreshedAt}, maxAge: {conversation.maxAge}")
            if conversation.refreshedAt + conversation.maxAge < now:
                sessionsToRemove.append(conversation.sessionId)
        for sessionId in sessionsToRemove:
            remove_conversation(sessionId)
    except Exception as e:
        logger.error(e)
        raise e
    finally:
        rlock.release()

