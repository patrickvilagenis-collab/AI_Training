release: python manage.py migrate --noinput
web: gunicorn ai_training.wsgi --bind 0.0.0.0:$PORT --workers 2 --log-file -
