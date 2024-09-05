import asyncio
from dotenv import load_dotenv
import os
from pydantic import BaseModel
import base64
import os
from pathlib import Path
from PIL import Image
from io import BytesIO
from apscheduler.schedulers.background import BackgroundScheduler

from fastapi import FastAPI, HTTPException, Header, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from youtube_utils import *
from chatbot import extractCode

load_dotenv()
DAYS_THRESHOLD = 1 
app=FastAPI()

app.mount("/static",StaticFiles(directory="static"),name="static")
templates=Jinja2Templates(directory="templates")
output_dir = 'static/videos/'

@app.get("/")
async def index(request:Request):
    return templates.TemplateResponse(
        request=request, name="home.html"
    )

@app.get("/about")
async def index(request:Request):
    return templates.TemplateResponse(
        request=request, name="about.html"
    )


@app.get("/tutorial")
async def index(request:Request,video_id:str):
    if not video_id:
        return RedirectResponse(url="/")
    file_name = video_id+".mp4"
    video_path = os.path.join(output_dir, file_name);
    if os.path.exists(video_path):
        path= "/videos/"+video_id
        poster_url = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        return templates.TemplateResponse(
        request=request, name="tutorial.html", context={"path": path, "poster_url": poster_url})
    else:
        return RedirectResponse(url="/")

@app.get("/tutorial/validate")
def validateTutorial(video_url: str):
    api_key = os.getenv('YOUTUBE_API_KEY')
    video_details = {}
    video_details, error = get_video_details_from_api(api_key, video_url)
    error_pytube = None
    if error is not None:
        print("error from api:", error)
        video_details, error_pytube = get_video_details(video_url)
    if error_pytube is not None:
            print("error from pytube:", error_pytube)
            return {"status": "error", 
                "message": error
                }
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
            video_id = tutorial_exists(url)
            if video_id is None:
              await websocket.send_json({"status": "error", "type": "tutorial_not_available"})  
              return
            file_name = video_id+".mp4"
            path_video = os.path.join(output_dir, file_name);
            if os.path.exists(path_video):
                await websocket.send_json( {"status":"success", "type": "video_downloaded", "video_id":video_id})
                return 
            await websocket.send_json( {"status":"success", "type": "starting_download"})
            asyncio.create_task(download_video(url,output_dir, websocket))
    except WebSocketDisconnect:
        pass

class ImageData(BaseModel):
    image_data: str

CHUNK_SIZE = 1024*1024
@app.get("/videos/{video_id}")
async def video_endpoint(video_id, range: str = Header(None)):
    video_path = Path(f"static/videos/{video_id}.mp4")
    if not video_path.is_file():
        raise HTTPException(status_code=404, detail=f"Video ID {video_id} does not exist.")
    start, end = range.replace("bytes=", "").split("-")
    start = int(start)
    end = int(end) if end else start + CHUNK_SIZE

    end = min(end, video_path.stat().st_size)

    with open(video_path, "rb") as video:
        video.seek(start)
        data = video.read(end - start)

        filesize = str(video_path.stat().st_size)
        headers = {
            'Content-Range': f'bytes {start}-{end-1}/{filesize}',
            'Accept-Ranges': 'bytes'
        }
        if start >= video_path.stat().st_size:
            headers['Content-Range'] = f'bytes */{filesize}'
            return Response(status_code=416, headers=headers)

        return Response(data, status_code=206, headers=headers, media_type="video/mp4")

@app.post("/scan/image")
async def scan_image(image_data: ImageData):
    try:
        image_data_str = image_data.image_data
        if not image_data_str.startswith('data:image/'):
            raise HTTPException(status_code=400, detail="Invalid image data format")        
        encoded_data = image_data_str.split(',')[1]
        decoded_image = base64.b64decode(encoded_data)
        image = Image.open(BytesIO(decoded_image))
        code = extractCode(image)
        return {"code": code}
    
    except Exception as e:
        print("error--:", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.exception_handler(HTTPException)
async def not_found_exception_handler(request, exc):
    if exc.status_code == 404:
        return RedirectResponse(url="/")
    return exc
