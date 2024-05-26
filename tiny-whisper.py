# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import whisper
import torch
import numpy as np

class AudioConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        audio_model = whisper.load_model("medium.en")
        audio_data = np.frombuffer(text_data, dtype=np.int16).astype(np.float32) / 32768.0
        result = audio_model.transcribe(audio_data, fp16=torch.cuda.is_available())
        text = result['text'].strip()
        await self.send(text)
