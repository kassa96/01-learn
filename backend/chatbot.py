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
          You must carefully examine the image provided by the user.
Your task is to meticulously scan the image to extract any code it contains.
Provide the programming language corresponding to the extracted code in the following format: '<lg__code>[name of language found]</lg__code><txt__code>[extracted code]</txt__code>'.
If you do not recognize the language of the extracted code, respond in this manner: '<lg__code>unknown</lg__code> <txt__code>[extracted code]</txt__code>'.
If you find no code in the image, respond with '<no__code/>'.
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
