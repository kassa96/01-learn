import datetime
import json
import os
import re
from fastapi import WebSocket
from pytube import YouTube
from requests import HTTPError
from youtube_transcript_api import YouTubeTranscriptApi
from pytube.exceptions import *
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

def get_video_transcript(video_id, language_code):
    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    try:
        transcript = transcript_list.find_transcript([language_code])
        text = ""
        for part in transcript.fetch():
            text += part['text'] + " "
        return text.strip()
    except Exception as e:
        return False
           
def get_video_translated(video_id, language_code):
    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    default_transcript = False
    for transcript in transcript_list:
        default_transcript = transcript
        break
    try:
        translated_transcript = default_transcript.translate(language_code)
        text = ""
        for part in translated_transcript.fetch():
            text += part['text'] + " "
        return text.strip()
    except Exception as e:
        return False           

def get_video_details(video_url):
    try:
        yt = YouTube(video_url)
        video_id = yt.video_id
        duration_seconds = yt.length
        duration = str(datetime.timedelta(seconds=duration_seconds))
        title = yt.title
        description = yt.description
        view_count = yt.views
        like_count = yt.rating
        published_at = yt.publish_date
        channel_title = yt.author
        thumbnail_url = yt.thumbnail_url
        logo_url = yt.thumbnail_url
        video_details = {
            "id": video_id,
            "duration": duration,
            "title": title,
            "description": description,
            "viewCount": view_count,
            "likeCount": like_count,
            "publishedAt": published_at,
            "thumbnailUrl": thumbnail_url,
            "channelTitle": channel_title,
            "logo": logo_url
        }
        return video_details, None 
    except RegexMatchError as e:        
        return None, "The provided URL is not valid."
    except VideoUnavailable as e:
        return None, "The requested video is unavailable."
    except LiveStreamError as e:
        return None, "Cannot download live streams."
    except AgeRestrictedError as e:
        return None, "The video is age-restricted."
    except VideoRegionBlocked as e:
        return None, "The video is blocked in your region."
    except PytubeError as e:
        return None, "An unexpected Pytube error occurred."
    except Exception as e:
        return None, "An unexpected error occurred."

def get_video_details_from_api(api_key, video_url):
    try:
        video_id_match = re.search(r'(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^\/\&\?]+)', video_url)
        if not video_id_match:
            return None, "The provided URL is not valid."      
        video_id = video_id_match.group(1)   
        API_SERVICE_NAME = "youtube"
        API_VERSION = "v3"    
        youtube = build(API_SERVICE_NAME, API_VERSION, developerKey=api_key)
        request = youtube.videos().list(
            part="snippet,contentDetails,statistics,status",
            id=video_id
        )
        response = request.execute()

        if not response.get('items'):
            return None, "Video info not exist or access denied"

        video_info = response['items'][0]
        privacy_status = video_info['status']['privacyStatus']
        duration = convert_iso_duration(video_info['contentDetails']['duration'])
        title = video_info['snippet']['title']
        description = video_info['snippet']['description']
        view_count = video_info['statistics']['viewCount']
        like_count = video_info['statistics'].get('likeCount', 0)
        published_at = video_info['snippet']['publishedAt']
        logo_url = video_info['snippet']['thumbnails']['default']['url']
        channel_title = video_info['snippet']['channelTitle'] 
        
        thumbnails = video_info['snippet']['thumbnails']
        if 'maxres' in thumbnails:
            thumbnail_url = thumbnails['maxres']['url']
        elif 'high' in thumbnails:
            thumbnail_url = thumbnails['high']['url']
        elif 'medium' in thumbnails:
            thumbnail_url = thumbnails['medium']['url']
        else:
            thumbnail_url = ""
        video_details = {
            "id": video_id, 
            "privacyStatus": privacy_status,
            "duration": duration,
            "title": title,
            "description": description,
            "viewCount": view_count,
            "likeCount": like_count,
            "publishedAt": published_at,
            "thumbnailUrl": thumbnail_url,
            "channelTitle": channel_title,
            "logo": logo_url
        }
        return video_details, None
    except HttpError as e:
        error_json = e.content.decode('utf-8')
        error = json.loads(error_json)['error']
        error_message = error['message']
        return None, error_message
    except Exception as e:
        return None, f"Unexpected Error: {str(e)}"

async def download_video(url: str, output_dir: str, websocket: WebSocket):
    try:
        yt = YouTube(url)
        stream = yt.streams.get_highest_resolution()
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        stream.download(output_dir)
        
        # Obtenir le nom de fichier par défaut
        default_filename = stream.default_filename
        
        # Obtenir l'ID de la vidéo
        video_id = yt.video_id
        
        # Renommer le fichier téléchargé avec l'ID de la vidéo
        extension = os.path.splitext(default_filename)[1]
        new_filename = f"{video_id}{extension}"
        os.rename(os.path.join(output_dir, default_filename), os.path.join(output_dir, new_filename))
        await websocket.send_json({"message": "download_successful", "filename": new_filename})
    except Exception as e:
        print("error:", e)
        await websocket.send_json({"status": "error", "message": "Downloading is instanely interruped: try another time or video"})
    finally:
        await websocket.close()


async def download_video1(url: str, output_dir: str, websocket: WebSocket):
    try:
        print("url----------:", url)
        yt = YouTube(url)
        stream = yt.streams.get_highest_resolution()
        if not stream:
            raise ValueError("Video not available")
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        stream.download(output_dir)
        default_filename = stream.default_filename
        video_id = yt.video_id
        extension = os.path.splitext(default_filename)[1]
        new_filename = f"{video_id}{extension}"
        os.rename(os.path.join(output_dir, default_filename), os.path.join(output_dir, new_filename))
        
        await websocket.send_json({"message": "download_successful", "filename": new_filename})
        
    except VideoUnavailable as e:
        print("error2:", e)
        await websocket.send_json({"status": "error", "message": "The requested video is unavailable."})

    except RegexMatchError as e:
        print("error1:", e)
        await websocket.send_json({"status": "error", "message": "The provided URL is not valid."})
            
    except LiveStreamError as e:
        print("error3:", e)
        await websocket.send_json({"status": "error", "message": "Cannot download live streams."})
        
    except AgeRestrictedError as e:
        print("error4:", e)
        await websocket.send_json({"status": "error", "message": "The video is age-restricted."})
        
    except VideoRegionBlocked as e:
        print("error5:", e)
        await websocket.send_json({"status": "error", "message": "The video is blocked in your region."})
        
    except PytubeError as e:
        print("error6:", e)
        await websocket.send_json({"status": "error", "message": "Error downloading video."})
        
    except ValueError as e:
        print("error7:", e)
        await websocket.send_json({"status": "error", "message": str(e)})
        
    except Exception as e:
        print("error8:", e)
        await websocket.send_json({"status": "error", "message": "Unexpected error occurred."})
        
    finally:
        await websocket.close()



def convert_iso_duration(duration):
    hours = 0
    minutes = 0
    seconds = 0
    duration = duration[2:]  # Remove 'PT' at the beginning
    while duration:
        value = ""
        while duration and duration[0].isdigit():
            value += duration[0]
            duration = duration[1:]
        if duration:
            unit = duration[0]
            duration = duration[1:]
            if unit == 'H':
                hours = int(value)
            elif unit == 'M':
                minutes = int(value)
            elif unit == 'S':
                seconds = int(value)

    return "{:02}:{:02}:{:02}".format(hours, minutes, seconds)
