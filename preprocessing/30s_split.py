
import os
import re
from pydub import AudioSegment

def parse_vtt(vtt_file_path):
    with open(vtt_file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    
    entries = []
    timestamp_pattern = re.compile(r'(\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}\.\d{3})')
    current_entry = {}

    for line in lines:
        line = line.strip()
        if timestamp_pattern.match(line):
            if current_entry:
                entries.append(current_entry)
                current_entry = {}
            current_entry['timestamp'] = line
        elif line and line != 'WEBVTT':
            if 'text' in current_entry:
                current_entry['text'] += ' ' + line
            else:
                current_entry['text'] = line
    
    if current_entry:
        entries.append(current_entry)
    
    return entries

def convert_to_30s_blocks(entries):
    blocks = []
    current_block = []
    current_start_time = None
    current_end_time = None
    
    for entry in entries:
        start_time, end_time = entry['timestamp'].split(' --> ')
        start_seconds = int(start_time.split(':')[0]) * 60 + float(start_time.split(':')[1])
        end_seconds = int(end_time.split(':')[0]) * 60 + float(end_time.split(':')[1])
        
        if current_start_time is None:
            current_start_time = start_seconds
            current_end_time = current_start_time + 30
        
        if end_seconds > current_end_time:
            current_block.append(entry)
            blocks.append(current_block)
            current_block = []
            current_start_time = current_end_time
            current_end_time = current_start_time + 30
        else:
            current_block.append(entry)
    
    if current_block:
        blocks.append(current_block)
    
    return blocks

def format_blocks(blocks):
    formatted_blocks = []
    
    for block in blocks:
        block_text = []
        for entry in block:
            block_text.append(entry['text'])
        formatted_blocks.append(' '.join(block_text))
    
    return formatted_blocks

def time_str_to_milliseconds(time_str):
    minutes, seconds = map(float, time_str.split(':'))
    return int((minutes * 60 + seconds) * 1000)

def split_audio(wav_file_path, blocks):
    audio = AudioSegment.from_wav(wav_file_path)
    audio_blocks = []
    for block in blocks:
        start_time = time_str_to_milliseconds(block[0]['timestamp'].split(' --> ')[0])
        end_time = time_str_to_milliseconds(block[-1]['timestamp'].split(' --> ')[1])
        audio_blocks.append(audio[start_time:end_time])
    return audio_blocks

def save_blocks(audio_blocks, formatted_blocks, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    for i, (audio_block, formatted_block) in enumerate(zip(audio_blocks, formatted_blocks)):
        audio_file_path = os.path.join(output_dir, f'part_{i+83}.wav')
        vtt_file_path = os.path.join(output_dir, f'part_{i+83}.txt')  # .txt 확장자로 변경
        
        audio_block.export(audio_file_path, format='wav')
        
        with open(vtt_file_path, 'w', encoding='utf-8') as text_file:
            text_file.write(formatted_block)

# 메인 실행 함수
def main(vtt_file_path, wav_file_path, output_dir):
    entries = parse_vtt(vtt_file_path)
    blocks = convert_to_30s_blocks(entries)
    formatted_blocks = format_blocks(blocks)
    audio_blocks = split_audio(wav_file_path, blocks)
    save_blocks(audio_blocks, formatted_blocks, output_dir)

# 사용 예시
if __name__ == "__main__":
    vtt_file_path = '/Users/choiinju/Downloads/STT_project_data/파키스탄.vtt'
    wav_file_path = '/Users/choiinju/Downloads/STT_project_data/파키스탄.wav'
    output_dir = './rr'
    
    main(vtt_file_path, wav_file_path, output_dir)
