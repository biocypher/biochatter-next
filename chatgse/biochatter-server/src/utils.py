
from typing import Dict, List
import os

from flask import Request
from src.constants import OPENAI_API_KEY

def parse_api_key(bearToken: str) -> str:
    if not bearToken:
        return ""
    bearToken = bearToken.strip()
    bearToken = bearToken.replace("Bearer ", "")
    return bearToken

def get_rag_agent_prompts() -> List[str]:
    return [
        "The user has provided additional background information from scientific "
        "articles.",
        "Take the following statements into account and specifically comment on "
        "consistencies and inconsistencies with all other information available to "
        "you: {statements}",
    ]

def get_auth(request):
    # If OPENAI_API_KEY is provided by server, we will use it
    if OPENAI_API_KEY in os.environ and os.environ[OPENAI_API_KEY]:
        return os.environ[OPENAI_API_KEY]
    
    # Otherwise, we will parse it from request
    auth = request.headers.get("Authorization")
    auth = auth if auth is not None and len(auth) > 0 else ""
    return parse_api_key(auth)
