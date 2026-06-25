"""
Views for the AI Training app.

The frontend is a single page (index). Everything else is a small JSON API used
for the *optional* account feature: register, login, logout, and progress sync.
No account is required to use the app — localStorage covers the default flow.
"""

import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET, require_POST

from .curriculum import CURRICULUM, UPCOMING, total_xp_available
from .models import Progress


def index(request):
    """Render the single-page app shell."""
    return render(request, "core/index.html")


@require_GET
def curriculum(request):
    """Serve all learning content + the upcoming-topics teaser as JSON."""
    return JsonResponse(
        {
            "weeks": CURRICULUM,
            "upcoming": UPCOMING,
            "total_xp": total_xp_available(),
        }
    )


def _parse_json(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except (ValueError, UnicodeDecodeError):
        return {}


def _user_payload(user):
    progress, _ = Progress.objects.get_or_create(user=user)
    return {"username": user.username, "progress": progress.data}


@require_GET
def me(request):
    """Return the logged-in user (and their synced progress), or anonymous."""
    if request.user.is_authenticated:
        return JsonResponse({"authenticated": True, **_user_payload(request.user)})
    return JsonResponse({"authenticated": False})


@require_POST
def register(request):
    data = _parse_json(request)
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if len(username) < 3:
        return JsonResponse({"error": "Username must be at least 3 characters."}, status=400)
    if len(password) < 6:
        return JsonResponse({"error": "Password must be at least 6 characters."}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({"error": "That username is already taken."}, status=400)

    user = User.objects.create_user(username=username, password=password)

    # Seed the account with whatever progress the browser already has.
    incoming = data.get("progress") or {}
    Progress.objects.create(user=user, data=incoming)

    login(request, user)
    return JsonResponse({"authenticated": True, **_user_payload(user)})


@require_POST
def login_view(request):
    data = _parse_json(request)
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"error": "Wrong username or password."}, status=400)

    login(request, user)
    return JsonResponse({"authenticated": True, **_user_payload(user)})


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({"authenticated": False})


@require_POST
def save_progress(request):
    """Persist the client's progress blob for a logged-in user."""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not logged in."}, status=401)

    data = _parse_json(request)
    progress, _ = Progress.objects.get_or_create(user=request.user)
    progress.data = data.get("progress") or {}
    progress.save()
    return JsonResponse({"ok": True})
