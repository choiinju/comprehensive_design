import whisper
import ssl
import numpy as np
import os
from transformers import pipeline


# SSL 인증 문제 해결
ssl._create_default_https_context = ssl._create_unverified_context

# Whisper 모델 로드
# model = whisper.load_model("small")
model_name_or_path = "/Users/choiinju/Downloads/2024-1/종설프로젝트/models/whisper_base_0606"
asr = pipeline(model=model_name_or_path, task="automatic-speech-recognition")


def wer(r, h):
    """
    Calculation of WER with Levenshtein distance.
    """
    # Initializing the matrix
    d = np.zeros((len(r)+1)*(len(h)+1), dtype=np.uint8)
    d = d.reshape((len(r)+1, len(h)+1))
    for i in range(len(r)+1):
        for j in range(len(h)+1):
            if i == 0:
                d[0][j] = j
            elif j == 0:
                d[i][0] = i

    # Computation
    for i in range(1, len(r)+1):
        for j in range(1, len(h)+1):
            if r[i-1] == h[j-1]:
                d[i][j] = d[i-1][j-1]
            else:
                substitution = d[i-1][j-1] + 1
                insertion    = d[i][j-1] + 1
                deletion     = d[i-1][j] + 1
                d[i][j] = min(substitution, insertion, deletion)

    # The WER is the ratio of the Levenshtein distance to the length of the reference text
    return d[len(r)][len(h)] / float(len(r))

# 디렉토리 경로 설정
directory = "/Users/choiinju/Downloads/STT_project_data/rr"

# 모든 WAV 파일 및 해당하는 텍스트 파일 찾기
audio_files = [f for f in os.listdir(directory) if f.endswith(".wav")]
text_files = [f for f in os.listdir(directory) if f.endswith(".txt")]

# 전체 WER 계산용 변수
total_error = 0
total_reference_length = 0

# WER 계산
for audio_file in audio_files:
    # 오디오 파일 경로 설정
    audio_path = os.path.join(directory, audio_file)
    
    # 오디오 파일을 텍스트로 변환
    # result = model.transcribe(audio_path) ## 기본 모델 사용시
    result = asr(audio_path)
    transcribed_text = result["text"]

    # 대응되는 텍스트 파일 찾기
    text_file = audio_file.replace(".wav", ".txt")
    if text_file in text_files:
        # 텍스트 파일 경로 설정
        text_path = os.path.join(directory, text_file)
        
        # 텍스트 파일 읽기
        with open(text_path, "r", encoding="utf-8") as file:
            reference_text = file.read().strip()
        
        # WER 계산
        reference = reference_text.split()
        hypothesis = transcribed_text.split()
        error_rate = wer(reference, hypothesis)
        
        # 결과 출력
        print(f"WER for {audio_file}: {error_rate}")
        
        # 전체 WER 계산용 변수 갱신
        total_error += error_rate * len(reference)
        total_reference_length += len(reference)
    else:
        print(f"Text file not found for {audio_file}")

# 통합 WER 계산
integrated_error_rate = total_error / total_reference_length
print(f"\nIntegrated WER: {integrated_error_rate}")