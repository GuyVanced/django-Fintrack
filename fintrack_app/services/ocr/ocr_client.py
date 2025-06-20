import json
import os
import google.generativeai as genai

# 1. Configure the SDK once, at import time, from a dedicated env var
genai.configure(api_key=os.getenv('GOOGLE_API_KEY_OCR'))

# 2. Updated prompt: valid JSON schema (commas, quotes), renamed "accuracy" → "completeness"
PROMPT = """
You are a JSON-output-only receipt-parsing assistant. Output only the raw JSON—no markdown fences or extra text.
Given the receipt image below, return exactly this schema:
{
  "merchant": "string",
  "date": "YYYY-MM-DD",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "unit_price": number,
      "total": number
    }
  ],
  "total": number,
  "category": "string",
  "completeness": number
  "description" : "string"
}
Where:
 - `completeness` = % of these 5 fields actually extracted (merchant,date,items,total,category).
 - If any field is missing or you are not confident about the value, use `null` (or empty list for `items`).
 - `category` must be one of:
   ["Food","Income","Housing","Groceries","Electronics","Transportation",
    "Dining","Healthcare","Shopping","Entertainment","Utilities","Other"]
 - 'description' should only be around 2-3 words (related to merchant/items/category)
"""

def clean_markdown_fences(text: str) -> str:
    """
    Strip leading/trailing ```json fences if the model wrapped its output.
    """
    txt = text.strip()
    if txt.startswith("```json"):
        lines = [ln for ln in txt.splitlines() if ln.strip() not in ("```json", "```")]
        return "\n".join(lines).strip()
    if txt.startswith("```") and txt.endswith("```"):
        return txt.strip("`").strip()
    return txt

def parse_receipt(image_bytes: bytes, mime_type: str) -> dict:
    """
    1) Send prompt + image to Gemini Vision
    2) Clean fences, parse JSON
    3) Compute 'completeness' = (# of non-null fields) / 5 * 100
    """
    model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")
    
    multimodal_input = [
    PROMPT,
    {"mime_type": mime_type, "data": image_bytes}
    ]
    
    # pass prompt and image as separate positional args
    response = model.generate_content(
        multimodal_input
    )

    cleaned = clean_markdown_fences(response.text)
    data = json.loads(cleaned)

    # compute completeness
    expected_fields = ["merchant", "date", "items", "total", "category"]
    found = 0
    for key in expected_fields:
        val = data.get(key)
        if val is None:
            continue
        if key == "items":
            if isinstance(val, list) and len(val) > 0:
                found += 1
        else:
            if val not in ("", []):
                found += 1

    data["completeness"] = round(found / len(expected_fields) * 100, 2)
    return data
