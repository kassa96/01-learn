# ExtractCode
**ExtractCode** is a website where users can submit a YouTube video URL to capture specific areas of the video and extract the code from them.
**extractCode** is designed to encourage aspiring programmers to practice by retrieving code snippets, allowing them to avoid watching an entire video without actively practicing.
# Installation
The application is built using Python in a virtual environment, TypeScript, FastAPI, and Tailwind. To simplify installation, I have provided the compiled TypeScript code in JavaScript and Tailwind, reducing the setup complexity for testing. All you need to install is Python. Once Python is installed, run this command to retrieve the application's source code:
```https://kassa96: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@github.com/kassa96/01-learn.git```
To retrieve information from a video, we use the YouTube API. For extracting code from an image, we use the Gemini API. Please log in to the Google Cloud Console to generate your API keys. To test the application, you can use the API keys provided in the `.env` file.
```YOUTUBE_API_KEY=AIzaSyDLA5AJZ-T-0Z5lau6KhfNPX48XeJVBYQQ
GEMINI_API_KEY = AIzaSyBLZUvBPoyKO2ppuF2FqbO_nF9vSfByymI```
# Excecution
To launch the application, run the following commands:
```cd /01-learn
fastapi run main.py```
