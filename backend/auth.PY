import requests
from jose import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

CLERK_ISSUER = "https://your-clerk-domain.clerk.accounts.dev"
JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json"

security = HTTPBearer()
jwks = requests.get(JWKS_URL).json()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        header = jwt.get_unverified_header(token)
        key = next(k for k in jwks["keys"] if k["kid"] == header["kid"])

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            options={"verify_aud": False}
        )
        return payload["sub"] 
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
