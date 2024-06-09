import whisper
import ssl
from transformers import pipeline
import time

# SSL 인증서 오류 방지 설정
ssl._create_default_https_context = ssl._create_unverified_context

# Whisper 모델 로드
model_name_or_path = "/Users/choiinju/Downloads/2024-1/종설프로젝트/models/whisper_base_0606"
asr = pipeline(model=model_name_or_path, task="automatic-speech-recognition")

# 오디오 파일 경로
audio_file_path = "/Users/choiinju/Downloads/STT_project_data/파키스탄.wav"

# 시작 시간 기록
start_time = time.time()

# 오디오 파일을 텍스트로 변환
result = asr(audio_file_path)

# 종료 시간 기록
end_time = time.time()

# 변환된 텍스트 출력
print(result["text"])

# 소요 시간 출력
print(f"Time taken for ASR: {end_time - start_time} seconds")
