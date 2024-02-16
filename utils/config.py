import os
import re

DATABASE_DSN = os.environ["TMA_DATABASE_DSN"]
PATH = os.getenv("TMA_PATH", "~/Library/Caches/com.apple.findmy.fmipcore/")
PORT = int(os.getenv("TMA_PORT", "8080"))
WHITELIST = os.getenv("TMA_WHITELIST", None)
