from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware
from youtube_utils import *

app=FastAPI()
app.mount("/static",StaticFiles(directory="static"),name="static")
app.add_middleware(GZipMiddleware)

templates=Jinja2Templates(directory="templates")

# Liste pour stocker les connexions WebSocket actives
websocket_connections = []

@app.get("/")
async def index(request:Request):
    return templates.TemplateResponse(
        request=request, name="home.html", context={"name": "kassa"}
    )

@app.get("/tutorial")
async def index(request:Request):
    return templates.TemplateResponse(
        request=request, name="tutorial.html", context={"name": "kassa"}
    )


@app.get("/tutorial/validate")
def validateTutorial(video_id: str):
    if video_id == False:
        return {"status": "error", "message": "id video not exist"}
    youtube = get_authenticated_service()
    video_details = get_video_details(youtube, video_id)
    if isinstance(video_details, dict):
        return {"status": "ok", "data": video_details}
    else:
        return {"status": "error", "message": video_details}
    

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_connections.append(websocket)
    try:
        while True:
            url = await websocket.receive_text()  # Recevoir l'URL sous forme de texte
            if url.strip():  # Vérifier si l'URL n'est pas vide
                await download_video(url.strip(), websocket)
    except WebSocketDisconnect:
        pass
    finally:
        websocket_connections.remove(websocket)

async def send_progress(progress, websocket):
    try:
        await websocket.send_json({
            "progress": progress
        })
    except Exception as e:
        print(f"Error sending progress: {e}")

async def download_video(url: str, websocket: WebSocket):
    try:
        youtube = YouTube(url)
        stream = youtube.streams.filter(progressive=True, file_extension='mp4').first()
        total_bytes = stream.filesize

        bytes_written = 0
        with open('video.mp4', 'wb') as f:
            # Téléchargement du flux vidéo
            stream.download(output_path='static/videos', filename='file')

            # Calcul de la progression du téléchargement
            while bytes_written < total_bytes:
                bytes_written = os.path.getsize('static/videos/file.mp4')
                progress = bytes_written / total_bytes
                await send_progress(progress, websocket)

            # Renommer le fichier temporaire une fois le téléchargement terminé
            os.rename('temp.mp4', 'video.mp4')

        await send_progress(1.0, websocket)  # Envoyer la progression finale

    except Exception as e:
        await websocket.send_json({
            "error": str(e)
        })