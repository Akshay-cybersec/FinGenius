import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from database import assets_col
from socket_manager import manager

router = APIRouter()

@router.websocket("/ws/market")
async def market_ws(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True: await asyncio.sleep(10) 
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.get("/market")
def get_market():
    return list(assets_col.find({}, {"_id":0}))