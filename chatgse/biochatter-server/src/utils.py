
from typing import Dict, List
import os

def parse_api_key(bearToken: str) -> str:
    if not bearToken:
        return ""
    bearToken = bearToken.strip()
    bearToken = bearToken.replace("Bearer ", "")
    return bearToken

def get_connection_args(vendor="milvus") -> Dict:
    host = "127.0.0.1" if not "HOST" in os.environ else os.environ["HOST"]
    port = "19530" if not "PORT" in os.environ else os.environ["PORT"]
    return {
        "host": host,
        "port": port
    }

def get_rag_agent_prompts() -> List[str]:
    return [
        "The user has provided additional background information from scientific "
        "articles.",
        "Take the following statements into account and specifically comment on "
        "consistencies and inconsistencies with all other information available to "
        "you: {statements}",
    ]
