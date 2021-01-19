from django.apps import AppConfig


class AppConfig(AppConfig):

    name = 'app'

    def ready(self) -> None:

        from app.utils import image_search
        image_search.initialize()

        return super().ready()