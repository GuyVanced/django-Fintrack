#!/bin/bash
# Build script for Railway deployment

echo "Starting build process..."

echo "Running Django migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Build completed successfully!" 