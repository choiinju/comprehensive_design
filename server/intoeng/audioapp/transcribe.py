import pickle

with open('/Users/ryan/Desktop/intoeng/comprehensive_design/server/intoeng/audioapp/whisper_small_0428.pkl', 'rb') as f:
        asr = pickle.load(f)     

def transcribe(audio_data):
    # 음성 데이터를 파이프라인에 전달
    transcription = asr(audio_data)
    return transcription['text']  # 텍스트 추출