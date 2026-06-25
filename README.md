# 🤖 AI Trainer — Learn AI in 5 minutes a day

A Duolingo-style web app that teaches AI fundamentals through bite-sized,
gamified lessons. Built with **Python / Django** and a dependency-free
vanilla-JS single-page front end. Works on phones, tablets and desktops
(375px → 2560px), no installation or login required.

---

## ✨ Features

- **Bite-sized sessions** — each ~5 minutes, 4–6 interactive exercises.
- **Four exercise types** — multiple choice, fill-in-the-blank, true/false,
  and tap-to-match.
- **Instant feedback** — every answer shows correct/incorrect with a short
  explanation.
- **Gamification** — daily 🔥 streaks, ⭐ XP, 🏅 levels (100 XP each),
  achievement-style completion screen with confetti.
- **Duolingo UX** — bright colors, winding lesson path, playful micro-
  animations, sticky check button, progress bars.
- **No login needed** — all progress lives in the browser's `localStorage`.
- **Optional free account** — create one to *sync* your streak & XP across
  devices (Django auth + a small JSON sync API).
- **Dashboard** — current week's topic, weekly completion, overall progress,
  streak counter and an "upcoming topics" teaser.
- **3 weeks of real content** included:
  1. **What is Machine Learning?** 🤖
  2. **Neural Networks** 🧠
  3. **Prompting Techniques** 💬

---

## 🚀 Quick start

```bash
# 1. (optional) create a virtualenv
python3 -m venv .venv && source .venv/bin/activate

# 2. install the single dependency
pip install -r requirements.txt

# 3. set up the database (SQLite, created automatically)
python manage.py migrate

# 4. run it
python manage.py runserver
```

Open **http://127.0.0.1:8000/** — that's it. Start tapping lessons; your
progress saves automatically.

> Optional: `python manage.py createsuperuser` then visit `/admin/` to inspect
> synced account progress.

---

## 🧱 Project structure

```
AI_Training/
├── manage.py
├── requirements.txt            # just Django
├── ai_training/                # Django project (settings, urls, wsgi/asgi)
└── core/                       # the app
    ├── curriculum.py           # ← ALL learning content lives here
    ├── models.py               # Progress (optional server-side sync)
    ├── views.py                # page + small JSON API
    ├── urls.py
    ├── templates/core/index.html   # SPA shell
    └── static/core/
        ├── css/styles.css      # Duolingo-style design system
        └── js/app.js           # the whole front-end engine
```

### How it fits together

- The backend is intentionally **thin**: it serves the page, hands the
  curriculum to the browser as JSON (`/api/curriculum`), and offers a tiny
  optional auth + progress-sync API.
- The **front end** (`app.js`) is the application. It renders the dashboard,
  lessons and profile, grades answers, and persists everything to
  `localStorage`. If the user is logged in, it also mirrors progress to the
  server so it follows them to other devices.

---

## ✍️ Adding / editing content

All lessons are plain Python data in **`core/curriculum.py`** — no database
edits, no migrations. To add a week, append a dict to `CURRICULUM`:

```python
{
    "id": "w4",
    "title": "Computer Vision",
    "subtitle": "How AI sees the world",
    "icon": "👁️",
    "color": "#ff4b4b",
    "sessions": [
        {
            "id": "w4s1",
            "title": "Pixels & Patterns",
            "subtitle": "...",
            "xp": 20,
            "exercises": [
                {"type": "info", "title": "...", "body": "..."},
                {"type": "mcq", "prompt": "...", "options": [...],
                 "answer": 0, "explain": "..."},
                # mcq | fill_blank | true_false | matching | info
            ],
        },
    ],
}
```

Exercise types: `info`, `mcq`, `fill_blank`, `true_false`, `matching`
(see the docstring at the top of `curriculum.py` for each one's shape).

---

## 🔌 API reference (optional account)

| Method | Path               | Purpose                                   |
|--------|--------------------|-------------------------------------------|
| GET    | `/api/curriculum`  | All weeks/sessions/exercises + teasers    |
| GET    | `/api/me`          | Current auth state + synced progress      |
| POST   | `/api/register`    | Create account (seeds with local progress)|
| POST   | `/api/login`       | Log in, returns synced progress           |
| POST   | `/api/logout`      | Log out (local progress stays on device)  |
| POST   | `/api/progress`    | Save the progress blob (logged-in users)  |

CSRF is enforced; the front end reads the `csrftoken` cookie (Django rotates
it on login/logout) and sends it as `X-CSRFToken`.

---

## 🌐 Deploying

The app runs on any standard Django host. For production:

```bash
export DJANGO_DEBUG=0
export DJANGO_SECRET_KEY="<a long random string>"
export DJANGO_ALLOWED_HOSTS="yourdomain.com"
export DJANGO_CSRF_TRUSTED_ORIGINS="https://yourdomain.com"
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn ai_training.wsgi   # or your WSGI/ASGI server of choice
```

Serve `STATIC_ROOT` via your web server (or add WhiteNoise if you prefer a
single process).

---

## 🧪 Tech & dependencies

- **Backend:** Django 5 (the *only* Python dependency), SQLite.
- **Frontend:** hand-written HTML/CSS/JS — **zero** JS frameworks or CSS
  libraries, so it loads fast even on slow connections. System font stack,
  inline SVG favicon, emoji iconography.

---

## ♿ Notes

- Respects `prefers-reduced-motion` (animations disabled).
- Keyboard support: number keys pick answers, **Enter** checks/continues.
- Mobile-first layout with safe-area insets for notched devices.
