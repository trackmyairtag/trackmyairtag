from utils.config import WHITELIST

def isIdWhitelisted(id: str) -> bool:
    if WHITELIST is None or WHITELIST in ('', 'None', '*', 'all'):
        return True

    ids = WHITELIST.split(',')
    return id in ids
