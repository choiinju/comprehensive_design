from pytube import YouTube
from moviepy.editor import AudioFileClip
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

# YouTube 영상 URL
youtube_url = 'https://www.youtube.com/watch?v=mFY0J5W8Udk'

# YouTube 영상 다운로드
yt = YouTube(youtube_url)
stream = yt.streams.filter(only_audio=True).first()
audio_file = stream.download(filename='audio.mp4')

# 오디오 파일을 WAV 형식으로 변환
audio_clip = AudioFileClip(audio_file)
audio_clip.write_audiofile("audio.wav", codec='pcm_s16le')

# 리소스 정리
audio_clip.close()
