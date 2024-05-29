
import json
from channels.generic.websocket import AsyncWebsocketConsumer
import io
from audioapp import transcribe

class AudioConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):

        if bytes_data:
            result = transcribe.transcribe(bytes_data)

            await self.send(text_data=json.dumps({
                'message': result
            }))
           
   