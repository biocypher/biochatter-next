
from typing import Dict

def parse_api_key(bearToken: str) -> Dict:
    bearToken = bearToken.strip()
    bearToken = bearToken.replace("Bearer ", "")
    return bearToken
