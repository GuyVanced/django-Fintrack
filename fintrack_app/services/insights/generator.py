from fintrack_app.services.insights.llm_client import call_llm
from fintrack_app.services.insights.payload import build_payload, make_prompt

def generate_monthly_insight(user, year: int, month: int):
    """
    Orchestrates payload build, prompt creation, LLM call, and persistence.
    Returns the generated summary text.
    """
    insight, payload = build_payload(user, year, month)
    prompt = make_prompt(payload)
    ai_text = call_llm(prompt)
    insight.llm_response = ai_text
    insight.save(update_fields=['llm_response'])
    return ai_text
