from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "users"

    def ready(self):
        # Import signal handlers to ensure they are connected when the app is ready.
        try:
            from . import signals  # noqa: F401
        except Exception:
            # Avoid raising during migrations or incomplete installs; log and continue.
            import logging

            logging.getLogger(__name__).exception("Failed to import users.signals")
