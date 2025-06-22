
# import os
# import google.generativeai as genai


# # Configure the SDK with your Google API key (set this in your env)
# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# if not GOOGLE_API_KEY:
#     raise RuntimeError("Missing GOOGLE_API_KEY environment variable")
# genai.configure(api_key=GOOGLE_API_KEY)


# model = genai.GenerativeModel('gemini-pro')  # or 'gemini-flash' if supported


# def call_llm(prompt: str,
#              model: str = "gemini-flash-2.5",
#              temperature: float = 0.7,
#              candidate_count: int = 1) -> str:
#     """
#     Calls Google Generative AI (Gemini) chat endpoint and returns the assistant's reply.
#     """
#     response = genai.chat.completions.create(
#         model=model,
#         temperature=temperature,
#         candidate_count=candidate_count,
#         # wrap your single prompt as a user message
#         messages=[{"author": "user", "content": prompt}],
#     )
#     # extract the top candidate's content
#     return response.choices[0].message.content


import os
import google.generativeai as genai

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("Missing GOOGLE_API_KEY environment variable")

# Configure SDK
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize model
model = genai.GenerativeModel('gemini-2.5-flash-preview-05-20')  # or 'gemini-flash' if supported

def call_llm(prompt: str,
             temperature: float = 0.7) -> str:
    """
    Calls Google Generative AI (Gemini) and returns the assistant's reply.
    """
    chat = model.start_chat()
    response = chat.send_message(prompt, generation_config={
        "temperature": temperature
    })
    return response.text
    # return f"This is your prompt : \n\n {prompt}"

