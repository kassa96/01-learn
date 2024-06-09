import youtube_utils

if __name__ == "__main__":
    video_url = "https://www.youtube.com/watch?v=u4wV0-31oI0"
    output_directory = "downloads"
    
    # print("Downloading video...")
    youtube_utils.download_video(video_url, output_directory)
    
    video_id = "bOjiI1RGDQ8"
    
    # Obtenir l'instance du service API YouTube
    youtube = youtube_utils.get_authenticated_service()
    
    # Obtenir les détails de la vidéo
    print("\nRécupération des détails de la vidéo...")
    video_details = youtube_utils.get_video_details(youtube, video_id)
    print("Détails de la vidéo:")
    print(video_details)
    
    # Obtenir le statut de confidentialité de la vidéo
    print("\nRécupération du statut de confidentialité de la vidéo...")
    privacy_status = youtube_utils.get_video_privacy_status(youtube, video_id)
    print("Statut de confidentialité de la vidéo:", privacy_status)
    
    # Code de langue pour la transcription
    language_code = "fr"
    
    # Obtenir la transcription de la vidéo dans la langue spécifiée
    print("\nRécupération de la transcription de la vidéo...")
    video_transcript = youtube_utils.get_video_transcript(video_id, language_code)
    if video_transcript:
        print("Transcription de la vidéo:")
        print(video_transcript)
    else:
        print("Aucune transcription disponible pour cette langue.")

# Obtenir la transcription de la vidéo dans la langue spécifiée
    # Code de langue pour la transcription
    language_code = "en"
    print("\nRécupération de la transcription de la vidéo...")
    video_transcript = youtube_utils.get_video_translated(video_id, language_code)
    if video_transcript:
        print("="*50,"Taduction de la vidéo:")
        print(video_transcript)
    else:
        print("Aucune traduction disponible pour cette langue.")
