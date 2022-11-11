import os
import re

DATABASE_DSN = os.environ["TMA_DATABASE_DSN"]
PATH = os.getenv("TMA_PATH", "~/Library/Caches/com.apple.findmy.fmipcore/")
PORT = int(os.getenv("TMA_PORT", "8080"))
REGEX_FILTER = os.getenv("TMA_REGEX_FILTER")
if REGEX_FILTER:
    REGEX_FILTER = re.compile(REGEX_FILTER)
