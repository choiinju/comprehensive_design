from rest_framework import serializers
from .models import AudioFile

class AudioFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioFile
        fields = ['id','audio']

    def get_audio_file_url(self, obj):
        request = self.context.get('request')
        audio_file_url = obj.audio_file.url
        return request.build_absolute_uri(audio_file_url)
