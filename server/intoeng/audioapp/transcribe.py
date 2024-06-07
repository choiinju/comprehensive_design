from transformers import pipeline
import soundfile as sf

def transcribe(audio_path):
    with open('/Users/ryan/Desktop/intoeng/comprehensive_design/server/intoeng/audioapp/whisper_small_0428.pkl', 'rb') as f:
        asr = pickle.load(f)       

    audio_data, _ = sf.read(audio_path)  # 오디오 데이터만 추출 
    transcription = asr(audio_data)
    return transcription['text']  # 텍스트 추출

