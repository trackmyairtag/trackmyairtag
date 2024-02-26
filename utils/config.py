import os
import re

DATABASE_DSN = os.environ["TMA_DATABASE_DSN"]
PATH = os.getenv("TMA_PATH", "~/Library/Caches/com.apple.findmy.fmipcore/")
PORT = int(os.getenv("TMA_PORT", "8080"))
ALLOWED_IDS = os.getenv("TMA_ALLOWED_IDS", None)

def is_id_allowed(id: str) -> bool:
    if ALLOWED_IDS is None or ALLOWED_IDS in ('', 'None', '*', 'all'):
        return True

    ids = ALLOWED_IDS.split(',')
    return id in ids
