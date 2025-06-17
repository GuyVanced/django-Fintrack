import smtplib
import ssl
import certifi

smtp_server = "smtp-relay.brevo.com"
port = 587
sender_email = "quester561@gmail.com"
receiver_email = "ayuzrizal47@gmail.com"
password = "***REMOVED***"

message = """\
Subject: Test Email from Python

This is a test email sent from a Python script."""

# Create a default SSL context with certifi's CA bundle
context = ssl.create_default_context(cafile=certifi.where())

try:
    with smtplib.SMTP(smtp_server, port) as server:
        server.starttls(context=context)  # Secure the connection
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message)
    print("Email sent successfully!")
except Exception as e:
    print(f"Failed to send email: {e}")