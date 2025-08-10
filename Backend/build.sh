#!/bin/bash
# Build script for Railway deployment

echo "Starting build process..."

# Install dependencies (Railway usually does this, but just in case)
echo "Installing dependencies..."
pip install -r requirements.txt

echo "Running Django migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Build completed successfully!" 