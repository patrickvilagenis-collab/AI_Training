from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/curriculum", views.curriculum, name="curriculum"),
    path("api/me", views.me, name="me"),
    path("api/register", views.register, name="register"),
    path("api/login", views.login_view, name="login"),
    path("api/logout", views.logout_view, name="logout"),
    path("api/progress", views.save_progress, name="save_progress"),
]
