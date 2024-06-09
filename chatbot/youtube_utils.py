import os
from pytube import YouTube
from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi

def on_progress(stream, chunk, bytes_remaining):
    total_size = stream.filesize
    bytes_downloaded = total_size - bytes_remaining
    percentage = (bytes_downloaded / total_size) * 100
    print(f"Downloading... {percentage:.2f}%")

def download_video(url, output_dir):
    try:
        yt = YouTube(url, on_progress_callback=on_progress)
        video = yt.streams.filter(progressive=True, file_extension='mp4').first()
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        video.download(output_dir)
        print("downloading completed!")
    except Exception as e:
        print("error downloading:", e)

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

def get_authenticated_service():
    API_KEY = "AIzaSyDLA5AJZ-T-0Z5lau6KhfNPX48XeJVBYQQ"
    API_SERVICE_NAME = "youtube"
    API_VERSION = "v3"
    return build(API_SERVICE_NAME, API_VERSION, developerKey=API_KEY)

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

def get_video_details(youtube, video_id):
    request = youtube.videos().list(
        part="snippet,contentDetails,statistics,status",
        id=video_id
    )
    response = request.execute()
    
    if not response['items']:
        return "video not found or access denied"
    
    video_info = response['items'][0]
    privacy_status = video_info['status']['privacyStatus']
    duration = convert_iso_duration(video_info['contentDetails']['duration'])
    title = video_info['snippet']['title']
    description = video_info['snippet']['description']
    view_count = video_info['statistics']['viewCount']
    like_count = video_info['statistics'].get('likeCount', 0)
    published_at = video_info['snippet']['publishedAt']
    thumbnail_url = video_info['snippet']['thumbnails']['default']['url']
    channel_title = video_info['snippet']['channelTitle'] 
    video_details = {
        "privacyStatus": privacy_status,
        "duration": duration,
        "title": title,
        "description": description,
        "viewCount": view_count,
        "likeCount": like_count,
        "publishedAt": published_at,
        "thumbnailUrl": thumbnail_url,
        "channelTitle": channel_title
    }
    
    return video_details

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
