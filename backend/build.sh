#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "--- Installing dependencies ---"
pip install --upgrade pip
pip install -r requirements.txt

echo "--- Collecting static files for WhiteNoise ---"
python manage.py collectstatic --no-input

echo "--- Applying database migrations ---"
python manage.py migrate

echo "--- Ensuring cache table exists for PostgreSQL throttling ---"
python manage.py createcachetable || true

echo "--- Build completed successfully ---"
