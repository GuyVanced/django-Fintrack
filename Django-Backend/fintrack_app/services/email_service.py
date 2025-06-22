from django.core.mail import send_mail
from django.conf import settings
import logging

logger=logging.getLogger(__name__)

class EmailService:
    @staticmethod

    def send_email(subject,message,recipient_email):
        try:
            send_mail(
                 subject,
                 message,
                 settings.DEFAULT_FROM_EMAIL,
                 [recipient_email],
                 fail_silently=False,

            )
            print(f"email sent to {recipient_email}")
            logger.info(f"Email sent to {recipient_email}")

        except Exception as e:
            logger.error(f"Failed to send email to {recipient_email}:{str(e)}")

    @staticmethod
    def send_budget_alert(user,category,total,budget_limit):
        subject=f"Budget Exceeded for {category.master_category.name}"
        message=(
            f"Hi {user.first_name or user.username},\n\n"
            f"You've exceeded your budget for the category : {category.master_category.name}.\n\n"
            f"Total spent : {total}\n\n"
            f"Budget limit: {budget_limit}\n\n"
            f"Take action to stay on track with your goals!"
        )

        EmailService.send_email(subject,message,user.email)

