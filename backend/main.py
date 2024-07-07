import asyncio
from fastapi import FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

from youtube_utils import *

load_dotenv()

app=FastAPI()
app.mount("/static",StaticFiles(directory="static"),name="static")

templates=Jinja2Templates(directory="templates")
output_dir = 'static/videos/'

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
        video_details, error = get_video_details(api_key, video_url)
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

async def download_video1(url: str, websocket: WebSocket):
    try:
        yt = YouTube(url)
        stream = yt.streams.get_highest_resolution()
        
        if not stream:
            raise ValueError("Video stream not available")
        output_dir = 'static/videos/'
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        stream.download(output_dir)
        default_filename = stream.default_filename
        video_id = yt.video_id
        extension = os.path.splitext(default_filename)[1]
        new_filename = f"{video_id}{extension}"
        os.rename(os.path.join(output_dir, default_filename), os.path.join(output_dir, new_filename))

        await websocket.send_json({"message": "download_successfull", "filename": new_filename})
        await websocket.close()        

    except ValueError as e:
        await websocket.send_json({"error": str(e)})
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        await websocket.send_json({"error": f"Error downloading video: {str(e)}"})
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")
