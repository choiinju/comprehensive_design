from transformers import pipeline
model_name_or_path = "/Users/ryan/Desktop/intoeng/comprehensive_design/server/intoeng/whisper_small_0428"
asr = pipeline(model=model_name_or_path, task="automatic-speech-recognition")

def transcribe(blob_data):
    # 음성 데이터를 파이프라인에 전달
    transcription = asr(blob_data)
    return transcription['text'] 