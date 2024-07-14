import os
from dotenv import load_dotenv
import pathlib
import textwrap
import PIL.Image

import google.generativeai as genai

from IPython.display import Markdown

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

def to_markdown(text) -> str:
  text = text.replace('•', '  *')
  return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))

def extractCode(url: str) -> str:
  img = PIL.Image.open(url)
  model = genai.GenerativeModel('gemini-1.5-flash')
  response = model.generate_content(["extract code from this image", img])
  markdown_output = to_markdown(response.text)
  print("generated text:", response.text)
  print("generated text markdown:", markdown_output.data)
  return response.text