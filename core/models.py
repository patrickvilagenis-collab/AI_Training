from django.contrib.auth.models import User
from django.db import models


class Progress(models.Model):
    """
    Optional server-side mirror of a learner's progress.

    The browser's localStorage is the primary store so the app works with no
    account at all. When a user *does* create an account, we sync the same
    JSON blob here so they can pick up on another device.
    """

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="progress")
    # The full progress object the client maintains (xp, streak, completed, …).
    data = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Progress<{self.user.username}>"
