import React, { useState, useEffect, useRef } from 'react';

const RealtimeAudio = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const socketRef = useRef(null);
  const [text, setText] = useState('');

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:8080/ws/intoeng/');
    socketRef.current.onopen = () => {
      console.log('WebSocket 연결 성공');
    };
    socketRef.current.onclose = () => {
      console.log('WebSocket 연결 종료');
    };
    socketRef.current.onerror = (error) => {
      console.error('WebSocket 오류:', error);
    };
    socketRef.current.onmessage = (event) => {
      let msg = JSON.parse(event.data).message;
      setText((text) => text + msg);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  function checkVolume(st) {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(st);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let silenceStart = Date.now();
    let flag = false;

    function analyze() {
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;

      let threshold = 128;
      const SILENCE_DURATION = 2000;

      if (average > threshold) {
        silenceStart = Date.now();
        flag = true;
      } else {
        if (Date.now() - silenceStart > SILENCE_DURATION && flag) {
          stopRecording();
          startRecording();
          return;
        }
      }

      requestAnimationFrame(analyze);
    }

    analyze();
  }

  const startRecording = () => {
    chunksRef.current = [];

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = function (e) {
          chunksRef.current.push(e.data);

          const blob = new Blob(chunksRef.current, {
            type: 'audio/ogg; codecs=opus',
          });

          socketRef.current.send(blob);
        };

        mediaRecorderRef.current.onstop = function () {
          console.log('오디오 멈춤');
        };

        mediaRecorderRef.current.start();

        checkVolume(stream);
      })
      .catch(function (err) {
        console.log('마이크에 접근하는 중에 오류가 발생했습니다: ' + err);
      });

    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  return (
    <div>
      <button onClick={startRecording} disabled={recording}>
        녹음 시작
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        녹음 중지
      </button>
      {text}
    </div>
  );
};

export default RealtimeAudio;
