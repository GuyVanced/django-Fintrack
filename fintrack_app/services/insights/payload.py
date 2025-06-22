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
    "You are a personal finance assistant. Given the following monthly transactions summary statistics JSON data for "
    "{start} to {end}, generate a personalised monthly financial insights report :\n"
    "1. Total income & breakdown\n"
    "2. Total expenses & breakdown\n"
    "3. Net savings or loss\n"
    "4. Key insights (e.g. spikes in spending, categorial anomalies/imbalance, income/expense source analysis)\n"
    "5. Month-over-month comparison\n"
    "6. Three concrete action items\n\n"
    "Data:\n```json\n{data}```\n\n"
    "Make sure you highlight the financial aspect of the summary, not the technical aspect like (these categories might be missing, check accurate recordings, etc.). "
    "You are generating the report that is being read directly by the user, so use sentence structures like (you, your, etc.) wherever appropriate. "
    "Show values and relative percentages wherever appropriate (e.g. Net Savings %, percentage of income, percentage of expense, etc.).\n\n"
    "Example format:\n"
    "Your Monthly Financial Insights: <Month> <Year>\n"
    "A one-sentence overview of your period (e.g. “This report provides … effectively.”)\n\n"
    "1. Your Income Snapshot\n"
    "In <Month>, your total income was a strong $X.\n\n"
    "Here’s how your income broke down:\n"
    "- <Category 1>: $A (B% of total income) – one-sentence interpretation.\n"
    "- <Category 2>: $C (D% of total income) – one-sentence interpretation.\n"
    "- …\n\n"
    "2. Your Spending Overview\n"
    "Your total expenses for <Month> amounted to $Y.\n\n"
    "Here’s how your spending broke down:\n"
    "- <Category 1>: $E (F% of total expenses) – one-sentence interpretation.\n"
    "- <Category 2>: $G (H% of total expenses) – one-sentence interpretation.\n"
    "- …\n\n"
    "3. Your Net Savings\n"
    "After accounting for all income and expenses, your net savings for <Month> was $Z,\n"
    "a net savings rate of R% ($Z / $X).\n\n"
    "4. Key Financial Insights for <Month>\n"
    "• Insight #1 – one-sentence.\n"
    "• Insight #2 – one-sentence.\n"
    "• Insight #3 – one-sentence.\n\n"
    "5. Month-over-Month Comparison (<PrevMonth> vs <Month>)\n"
    "• Income Growth: +$Δ income\n"
    "• Expense Surge: +$Δ expense\n"
    "• Net Savings Change: +$Δ net\n\n"
    "6. Actionable Steps for Next Month\n"
    "1. Recommendation #1\n"
    "2. Recommendation #2\n"
    "3. Recommendation #3\n"
)
    return template.format(
        start=payload['period_start'],
        end=payload['period_end'],
        data=json.dumps(payload, indent=2)
    )
