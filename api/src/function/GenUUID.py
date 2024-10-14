import uuid
def generateUUID(NumberOfChar: int=16) -> str:
    if NumberOfChar > 32:
        NumberOfChar = 32
    return str(uuid.uuid4()).replace('-', '')[:NumberOfChar]