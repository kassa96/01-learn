# ExtractCode
**ExtractCode** is a website where users can submit a YouTube video URL to capture specific areas of the video and extract the code from them.\
**extractCode** is designed to encourage aspiring programmers to practice by retrieving code snippets, allowing them to avoid watching an entire video without actively practicing.
# Installation
The application is built using Python in a virtual environment, TypeScript, FastAPI, and Tailwind. To simplify installation, I have provided the compiled TypeScript code in JavaScript and Tailwind, reducing the setup complexity for testing. \All you need to install is Python.\
Once Python is installed, run this command to retrieve the application's source code:\
```git clone https://github.com/kassa96/01-learn.git```
To retrieve information from a video, we use the YouTube API. 
For extracting code from an image, we use the Gemini API. 
Please log in to the Google Cloud Console to generate your API keys.\
To test the application, you can use the API keys provided in the `.env` file.
```
YOUTUBE_API_KEY=AIzaSyDLA5AJZ-T-0Z5lau6KhfNPX48XeJVBYQQ
GEMINI_API_KEY = AIzaSyBLZUvBPoyKO2ppuF2FqbO_nF9vSfByymI
```
# Excecution
To launch the application, run the following commands:
```
cd 01-learn/
python3 -m venv venv 
source venv/bin/activate 
pip install -r requirements.txt
fastapi run main.py
```
# Contribution
To make changes to the source code, the complete code can be found in the dev-app branch ```git switch dev-app```. 
If the changes are related to CSS, install Tailwind. If they are related to the frontend, install Node and TypeScript. To run the program in watch mode, open three terminals and execute the following commands in each 
```
npm run watch:css
tsc -w
fastapi run main.py
```
