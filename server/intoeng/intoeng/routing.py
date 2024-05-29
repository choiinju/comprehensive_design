# yourprojectname/routing.py
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from .consumers import AudioConsumer

websocket_urlpatterns = [
    path('ws/intoeng/', AudioConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    'websocket': URLRouter(websocket_urlpatterns),
})
