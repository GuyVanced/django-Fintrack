import json
from dateutil.relativedelta import relativedelta

from .aggregation import get_date_range, fetch_aggregates, compute_comparisons
from fintrack_app.models import MonthlyInsight

def build_payload(user, year: int, month: int):
    start, end = get_date_range(year, month)
    prev_start, _ = get_date_range(*( (start - relativedelta(months=1)).timetuple()[:2] ))
    _, prev_end = get_date_range(prev_start.year, prev_start.month)

    current  = fetch_aggregates(user, start, end)
    previous = fetch_aggregates(user, prev_start, prev_end)
    deltas   = compute_comparisons(current, previous)

    payload = {
        'period_start': start.isoformat(),
        'period_end':   (end - relativedelta(days=1)).isoformat(),
        **current,
        **deltas
    }

    # Persist input for auditing and UI history
    insight = MonthlyInsight.objects.create(
        user=user,
        period_start=start,
        period_end=end - relativedelta(days=1),
        prompt_payload=payload
    )
    return insight, payload

def make_prompt(payload: dict) -> str:
    template = (
        "You are a personal finance assistant. Given the following JSON data for "
        "{start} to {end}, generate summary financial monthly report  :\n"
        "1. Total income & breakdown\n"
        "2. Total expenses & breakdown\n"
        "3. Net savings or loss\n"
        "4. Key insights (e.g. spikes in spending, categorial anomalies/imbalance)\n"
        "5. Month-over-month comparison\n"
        "6. Three concrete action items\n\n"
        "Data:\n```json\n{data}```"
    )
    return template.format(
        start=payload['period_start'],
        end=payload['period_end'],
        data=json.dumps(payload, indent=2)
    )
