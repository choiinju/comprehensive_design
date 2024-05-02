from django.db import models

class AudioFile(models.Model):
    audio = models.FileField(upload_to='audio_files/')  # 파일이 저장될 경로를 지정
