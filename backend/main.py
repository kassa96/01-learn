import asyncio
import time
from dotenv import load_dotenv
import os
from pydantic import BaseModel
import base64
from io import BytesIO
from PIL import Image
import os
import uuid

from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from youtube_utils import *
from chatbot import extractCode

load_dotenv()

app=FastAPI()
app.mount("/static",StaticFiles(directory="static"),name="static")

templates=Jinja2Templates(directory="templates")
output_dir = 'static/videos/'

@app.get("/ask")
async def index(request:Request):
    return templates.TemplateResponse(
        request=request, name="ask.html")

@app.get("/")
async def index(request:Request):
    return templates.TemplateResponse(
        request=request, name="home.html", context={"name": "kassa"}
    )


@app.get("/tutorial")
async def index(request:Request,video_id:str):
    if not video_id:
        return RedirectResponse(url="/")
    output_dir = 'static/videos/'
    file_name = video_id+".mp4"
    video_path = os.path.join(output_dir, file_name);
    if os.path.exists(video_path):
        return templates.TemplateResponse(
        request=request, name="tutorial.html", context={"video_path": video_path, "poster_url": ""})
    else:
        return RedirectResponse(url="/")

@app.get("/tutorial/validate")
def validateTutorial(video_url: str):
    api_key = os.getenv('YOUTUBE_API_KEY')
    video_details = {}
    if api_key:
        video_details, error = get_video_details_from_api(api_key, video_url)
    else:
        video_details, error = get_video_details(video_url)
    if error is not None:
        video_details, error = get_video_details_from_api(api_key, video_url)
        print("error from api:", error)
        if error is not None:
            print("error from pytube:", error)
            return {"status": "error", 
                "message": error
                }
    print("video details::", video_details)
    file_name = video_details["id"]+".mp4"
    path_video = os.path.join(output_dir, file_name);
    if os.path.exists(path_video):
        return {"status": "video_downloaded", "data": video_details}
    else:
        return {"status": "ok", "data": video_details}
    
@app.websocket("/ws/download/")
async def websocket_download_video(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            url = data.strip()
            await websocket.send_json({"message": "starting_download"})
            asyncio.create_task(download_video(url,output_dir, websocket))
    except WebSocketDisconnect:
        pass

class ImageData(BaseModel):
    image_data: str

@app.post("/save/image")
async def save_image(image_data: ImageData):
    try:
        decoded_image = base64.b64decode(image_data.image_data.split(',')[1])        
        timestamp = int(time.time() * 1000)  
        random_str = str(uuid.uuid4().hex[:4])   
        filename = f"image_{timestamp}_{random_str}.png"
        
        # Sauvegarder le fichier
        path = os.path.join("static", "captures", filename)
        with open(path, "wb") as f:
            f.write(decoded_image)
        code = extractCode(path)
        return {"filename": filename, "code": code}
    except Exception as e:
        print("error--:", e)
        raise HTTPException(status_code=500, detail=str(e))