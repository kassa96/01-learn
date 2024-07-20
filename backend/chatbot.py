import os
from dotenv import load_dotenv
import textwrap
from google.api_core import retry, exceptions

import google.generativeai as genai

from IPython.display import Markdown

load_dotenv()
api_key = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=api_key)

def to_markdown(text) -> str:
  text = text.replace('•', '  *')
  return Markdown(textwrap.indent(text, '/n ', predicate=lambda _: True))

def extractCode(img) -> str:
  try:
      model = genai.GenerativeModel('gemini-1.5-flash')
      prompt = """"
          Dear Gemini, your unique task is to extract any code found in an image. 
          the extracted code must not be surrounded by anything. 
          Extract this code in this image.
          you must surround the code with single quotes.
           """
      response = model.generate_content([prompt, img], request_options={"retry": retry.Retry(predicate=retry.if_transient_error)})
      #print("meta data:", response.usage_metadata)
      markdown_output = to_markdown(response.text)
      #print("generated text:", response.text)
      #print("generated text markdown:", markdown_output.data)
      return  markdown_output.data
  except exceptions.ServiceUnavailable as e:
        print(f"Error: {e}")
        raise e
