from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.postgres.fields import JSONField

User = get_user_model()

class MonthlyInsight(models.Model):
    user            = models.ForeignKey(User, on_delete=models.CASCADE, related_name='monthly_insights')
    period_start    = models.DateField()
    period_end      = models.DateField()
    prompt_payload  = JSONField()
    llm_response    = models.TextField(blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'period_start', 'period_end')
        ordering = ['-period_start']

    def __str__(self):
        return f"Insight {self.user.email} {self.period_start:%Y-%m}"
