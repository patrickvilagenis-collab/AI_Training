# Container image — works on Fly.io, Google Cloud Run, Railway, Koyeb, etc.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_DEBUG=0 \
    PORT=8000

WORKDIR /app

# Install dependencies first for better layer caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static assets at build time (a temporary key is fine here; the real
# one is supplied at runtime via DJANGO_SECRET_KEY).
RUN DJANGO_SECRET_KEY=build-only-key python manage.py collectstatic --noinput

EXPOSE 8000

# Run migrations then start gunicorn. Uses $PORT so it works on hosts that
# inject their own port.
CMD sh -c "python manage.py migrate --noinput && \
    gunicorn ai_training.wsgi --bind 0.0.0.0:${PORT} --workers 2 --log-file -"
