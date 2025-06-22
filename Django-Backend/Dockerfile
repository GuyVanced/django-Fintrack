# Use official Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files
COPY . .

# Expose port for Gunicorn
EXPOSE 8000

# Collect static files (optional now, needed in prod)
RUN python manage.py collectstatic --noinput

# Run migrations and start the server using gunicorn
CMD ["gunicorn", "djangoBackend.wsgi:application", "--bind", "0.0.0.0:8000"]
