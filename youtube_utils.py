import datetime
import json
import os
import re
from fastapi import WebSocket
from pytubefix import YouTube
from requests import HTTPError
from youtube_transcript_api import YouTubeTranscriptApi
from pytube.exceptions import *
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import uuid
import time
import cv2

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

def tutorial_exists(url):
    try:
        yt = YouTube(url)
        return yt.video_id
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return None

async def download_video(url: str, output_dir: str, websocket: WebSocket):
    try:
        yt = YouTube(url)
        stream = yt.streams.get_highest_resolution()
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        stream.download(output_dir)        
        default_filename = stream.default_filename
        video_id = yt.video_id
        extension = os.path.splitext(default_filename)[1]
        new_filename = f"{video_id}{extension}"
        os.rename(os.path.join(output_dir, default_filename), os.path.join(output_dir, new_filename))
        await websocket.send_json({"status": "success", "type": "download_successful", "video_id":video_id})
    except Exception as e:
        print("error:", str(e))
        await websocket.send_json({"status": "error", "type": "interruped_downloading_video"})
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

def capture_frame(video_path, output_dir, frame_time, image_width, image_height, rect_x, rect_y, rect_width, rect_height)-> str:
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print("Error: Impossible to read the video.")
        return ""
    
    cap.set(cv2.CAP_PROP_POS_MSEC, frame_time * 1000)
    ret, frame = cap.read()
    
    if ret:
        frame = cv2.resize(frame, (image_width, image_height))        
        cropped_frame = frame[rect_y:rect_y+rect_height, rect_x:rect_x+rect_width]        
        timestamp = int(time.time() * 1000)
        random_str = str(uuid.uuid4().hex[:4])
        filename = f"image_{timestamp}_{random_str}.png"        
        output_path = os.path.join(output_dir, filename)        
        cv2.imwrite(output_path, cropped_frame)
        cap.release()
        cv2.destroyAllWindows()
        return output_path
    else:
        print("Error: Impossible to capture image from video.")
        cap.release()
        cv2.destroyAllWindows()
        return ""    
    



