from django.apps import AppConfig
import sys


class AppConfig(AppConfig):

    name = 'app'

    def ready(self) -> None:

        if 'runserver' in sys.argv:
            from app.utils import image_search
            image_search.initialize()

        return super().ready()