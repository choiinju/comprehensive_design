from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from audioapp import transcribe

import numpy as np
import io
from scipy.io.wavfile import read

from .models import AudioFile
from .serializers import AudioFileSerializer

class AudioUploadView(APIView):
    def post(self, request, format=None):
        serializer = AudioFileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            result = transcribe.transcribe("/Users/ryan/Desktop/intoeng/comprehensive_design/server/intoeng/audioapp/audio.wav")

            return Response(result, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AudioFileList(generics.ListAPIView):
    queryset = AudioFile.objects.all()
    serializer_class = AudioFileSerializer