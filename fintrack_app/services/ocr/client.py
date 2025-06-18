import json
import os
import google.generativeai as genai


# configure once, at import time
genai.configure(api_key=os.getenv('GOOGLE_API_KEY_OCR'))

PROMPT = """
You are a JSON-output-only receipt-parsing assistant. You will Output only the JSON object. You do not print any other text.
Given the receipt image below, output a JSON object with these keys:
{
    "merchant": "string"
    "date": "YYYY-MM-DD"
    "items": [{"name" : "string", "quantity" : "number", "unit_price" : "number", "total : "number"}]
    "total": "number"
    "category": "string"
    "accuracy" : "number"
}
"accuracy" is to be calculated using (total correctly identified)/ (total no. of fields)* 100. Derive accuracy based on given rules. 
Rules : 
(1)The identification of the values for the field(keys) should be done with confidence. (1)If any field is missing or can't be identified confidently, use `null` or an empty list. (3)Based on the receipt data, predict which one(1) of the allowed categories the bill falls under and put that in the 'category' key if confidently identified.
(4)Allowed Categories : ["Food", "Income", "Housing", "Groceries", "Electronics", "Transportation", "Dining", "Healthcare", "Shopping", "Entertainment", "Utilities", "Other"] (5) null / missing will affect accuracy.
(5)Do NOT output any text other than the final JSON object.
"""  

def clean_markdown_fences(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        lines = [ln for ln in text.splitlines() if ln.strip() not in ("```json","```")]
        return "\n".join(lines).strip()
    if text.startswith("```") and text.endswith("```"):
        return text.strip("`").strip()
    return text

def parse_receipt(image_bytes: bytes, mime_type: str) -> dict:
    model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")
    multimodal_input = [PROMPT, {"mime_type": mime_type, "data": image_bytes}]
    response = model.generate_content(multimodal_input)
    cleaned = clean_markdown_fences(response.text)
    return json.loads(cleaned)
