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

            audio_bytes= request.data['audio'].file.getvalue()        
            _, data = read(io.BytesIO(audio_bytes))

            # # data가 스테레오인 경우(2채널), 모노(1채널)로 변환
            if len(data.shape) > 1:
                data = np.mean(data, axis=1)

            # 데이터 정규화
            data = data / np.max(np.abs(data),axis=0)      
            
            result = transcribe.transcribe(data)

            return Response(result, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AudioFileList(generics.ListAPIView):
    queryset = AudioFile.objects.all()
    serializer_class = AudioFileSerializer