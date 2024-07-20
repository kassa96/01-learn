import asyncio
from dotenv import load_dotenv
import os
from pydantic import BaseModel
import base64
import os
from pathlib import Path
from PIL import Image
from io import BytesIO

from fastapi import FastAPI, HTTPException, Header, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from youtube_utils import *
from chatbot import extractCode

load_dotenv()
app=FastAPI()
app.mount("/static",StaticFiles(directory="static"),name="static")
templates=Jinja2Templates(directory="templates")
output_dir = 'static/videos/'

@app.get("/ask")
async def index(request:Request,video_id:str):
    if not video_id:
        return RedirectResponse(url="/")
    file_name = video_id+".mp4"
    video_path = os.path.join(output_dir, file_name);
    if os.path.exists(video_path):
        path= "/videos/"+video_id
        return templates.TemplateResponse(
        request=request, name="ask.html", context={"path": path, "poster_url": ""})
    else:
        return RedirectResponse(url="/")
@app.get("/")
async def index(request:Request):
    return templates.TemplateResponse(
        request=request, name="home.html"
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

CHUNK_SIZE = 1024*1024
@app.get("/videos/{video_id}")
async def video_endpoint(video_id, range: str = Header(None)):
    video_path = Path(f"static/videos/{video_id}.mp4")
    if not video_path.is_file():
        raise HTTPException(status_code=404, detail=f"Video ID {video_id} does not exist.")
    start, end = range.replace("bytes=", "").split("-")
    start = int(start)
    end = int(end) if end else start + CHUNK_SIZE

    # Assurez-vous que end ne dépasse pas la taille réelle du fichier
    end = min(end, video_path.stat().st_size)

    with open(video_path, "rb") as video:
        video.seek(start)
        data = video.read(end - start)

        filesize = str(video_path.stat().st_size)
        headers = {
            'Content-Range': f'bytes {start}-{end-1}/{filesize}',
            'Accept-Ranges': 'bytes'
        }

        # Si start est égal ou supérieur à la taille du fichier, renvoyer une réponse vide avec le code 416 (Requested Range Not Satisfiable)
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
        print("code:", code)
        return {"code": code}
    
    except Exception as e:
        print("error--:", e)
        raise HTTPException(status_code=500, detail=str(e))
