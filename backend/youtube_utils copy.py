import datetime
import os
from pytube import YouTube
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from youtube_transcript_api import YouTubeTranscriptApi
import re
import json

def get_video_id(url):
    pattern = r"(?<=v=)[a-zA-Z0-9_-]+(?=&|\?|$)"
    match = re.search(pattern, url)
    if match:
        return match.group(0)
    else:
        return None

def download_video(url: str, output_dir: str):
    try:
        yt = YouTube(url)
        stream = yt.streams.get_highest_resolution()
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        stream.download(output_dir)
        
        # Obtenir le nom de fichier par défaut
        default_filename = stream.default_filename
        
        # Obtenir l'ID de la vidéo
        video_id = get_video_id(url)
        
        # Renommer le fichier téléchargé avec l'ID de la vidéo
        extension = os.path.splitext(default_filename)[1]
        new_filename = f"{video_id}{extension}"
        os.rename(os.path.join(output_dir, default_filename), os.path.join(output_dir, new_filename))
        
        return video_id
    
    except KeyError:
        raise ValueError("Error: Video is not available or cannot be downloaded")
    
    except ValueError:
        raise ValueError("Error: Invalid URL")
    
    except Exception as e:
        raise ValueError(f"Error downloading video")


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

def get_authenticated_service(key):
    API_SERVICE_NAME = "youtube"
    API_VERSION = "v3"
    try:
        service = build(API_SERVICE_NAME, API_VERSION, developerKey=key)
        return service
    except HttpError as e:
        error_json = e.content.decode('utf-8')
        error = json.loads(error_json)['error']
        error_message = error['message']
        print(f"HTTP Error {e.status_code}: {error_message}")
        return error_message        
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")
        return "error"

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

def get_details(video_url):
    try:
        yt = YouTube(video_url)
        duration_seconds = yt.length
        duration = str(datetime.timedelta(seconds=duration_seconds))
        title = yt.title
        description = yt.description
        view_count = yt.views
        like_count = yt.description
        published_at = yt.publish_date
        channel_title = yt.author
        thumbnails = yt.thumbnail_url
        thumbnail_url = thumbnails[-1] 
        logo_url = thumbnails[0] 
        video_details = {
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

        return video_details

    except Exception as e:
        print(f"Une erreur s'est produite : {str(e)}")
        return None

def get_video_details(youtube, video_id):
    try:
        request = youtube.videos().list(
            part="snippet,contentDetails,statistics,status",
            id=video_id
        )
        response = request.execute()

        if not response.get('items'):
            print("Video info not exist or access denied")
            return "error"

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
        return video_details
    except HttpError as e:
        error_json = e.content.decode('utf-8')
        error = json.loads(error_json)['error']
        error_message = error['message']
        print(f"HTTP Error {e.status_code}: {error_message}")
        return error_message
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")
        return "error"
    
def get_best_thumbnail_url(youtube, video_id):
    try:
        request = youtube.videos().list(
            part="snippet",
            id=video_id
        )
        response = request.execute()
        if not response.get('items'):
            print("Video not found or access denied")
            return "error"
        video_info = response['items'][0]
        thumbnails = video_info['snippet']['thumbnails']
        # Try to find the best available thumbnail URL
        if 'maxres' in thumbnails:
            thumbnail_url = thumbnails['maxres']['url']
        elif 'high' in thumbnails:
            thumbnail_url = thumbnails['high']['url']
        elif 'medium' in thumbnails:
            thumbnail_url = thumbnails['medium']['url']
        else:
            thumbnail_url = ""
        return thumbnail_url
    except HttpError as e:
        error_json = e.content.decode('utf-8')
        error = json.loads(error_json)['error']
        error_message = error['message']
        print(f"HTTP Error {e.status_code}: {error_message}")
        return error_message
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")
        return "error"
    
def get_video_privacy_status(youtube, video_id):
    request = youtube.videos().list(
        part="status",
        id=video_id
    )
    response = request.execute()
    
    if not response['items']:
        return "video not found or access denied"
    
    privacy_status = response['items'][0]['status']['privacyStatus']
    return privacy_status
