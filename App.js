// 리액트 예시
// 버튼을 눌러서 실시간 녹음을 키고 양방향 통신(소켓)을 사용.! 일정단위 데이터를 바로 서버에 보냄
// App.js
import React, { useState } from 'react';
import axios from 'axios';
import { ReactMic } from 'react-mic';

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [socket, setSocket] = useState(null);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const onData = (recordedBlob) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(recordedBlob.blob);
    }
  };

  const onStop = async (recordedBlob) => {
    // 녹음이 완료되었을 때 실행되는 콜백 함수
  };

  useEffect(() => {
    const newSocket = new WebSocket('ws://your-server-url.com/audio'); // WebSocket 서버 URL로 변경
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      setTranscription(event.data);
    };
  }, [socket]);

  return (
    <div>
      <h1>음성 입력</h1>
      <button onClick={startRecording} disabled={isRecording}>
        녹음 시작
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        녹음 중지
      </button>
      <ReactMic
        record={isRecording}
        onStop={onStop}
        onData={onData}
        mimeType="audio/wav"
      />
      <div>
        <h2>인식된 텍스트:</h2>
        <p>{transcription}</p>
      </div>
    </div>
  );
};

export default App;
