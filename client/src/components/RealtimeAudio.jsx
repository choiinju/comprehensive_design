import React, { useState, useEffect, useRef } from 'react';
import styles from './realtime_audio.module.scss';
import start from '../images/start.svg';
import stop from '../images/stop.svg';
import copy from '../images/copy.svg';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import loading from '../images/loading.json';

const RealtimeAudio = () => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const socketRef = useRef(null);
  const [text, setText] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const messagesEndRef = useRef(null);

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
      setText((text) => [...text, msg]);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {
    scrollToBottom();
  }, [text]);

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

  const copyContent = () => {
    navigator.clipboard.writeText(text.join('\n'));
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <div
        style={{
          borderBottom: '3px solid #EBEBEB',
          display: 'flex',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          backgroundColor: 'white',
        }}
      >
        <Link className={`${styles.logo}`} to="/">
          INTOENG
        </Link>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {recording ? (
            <img
              src={stop}
              width={'40px'}
              height={'40px'}
              onClick={() => {
                stopRecording();
                setIsActive(false);
              }}
            />
          ) : (
            <img
              src={start}
              width={'40px'}
              height={'40px'}
              onClick={() => {
                startRecording();
                setIsActive(true);
              }}
            />
          )}
          <div style={{ marginRight: '20px' }} />
          <div className={`${styles.timer}`}>{formatTime(seconds)}</div>
          <div style={{ marginRight: '20px' }} />
        </div>
      </div>
      <div style={{ marginTop: '100px' }} />
      <div className={`${styles.start_notice}`}>
        <div>
          {`안녕하세요.\n저는 당신의 인도 영어 이해를 도와줄 도우미,`}
          <span className={`${styles.orange}`}> INTOENG</span>
          {`입니다. \n녹음 방법과 주의사항을 안내해 드리겠습니다.\n\n`}
          <span className={`${styles.bigger}`}>녹음 방법</span>
          {`\n1) 우측 상단의`}

          <span className={`${styles.red}`}> 빨간 동그라미 버튼</span>
          {`을 클릭하면 녹음이 시작됩니다.\n2) 녹음을 중단하고 싶으시면, 동일한 위치의`}
          <span className={`${styles.black}`}> 멈춤 버튼</span>
          {`을 눌러주세요.\n\n`}
          <span className={`${styles.bigger}`}>주의사항</span>
          {`\n녹음 내역은 저장되지 않습니다.`}
        </div>
      </div>
      {text.length !== 0 && (
        <div className={`${styles.res_container}`}>
          <div className={`${styles.response}`}>
            {text.join('\n')}
            <div style={{ marginTop: '10px' }} />
            {!recording && text.length !== 0 && (
              <div className={`${styles.copy}`}>
                <img
                  src={copy}
                  width={'17px'}
                  height={'17px'}
                  onClick={startRecording}
                />
                <div onClick={copyContent}>간편 복사하기</div>
              </div>
            )}
          </div>

          {recording && (
            <Lottie
              style={{ width: '200px', height: '100px' }}
              animationData={loading}
            />
          )}
        </div>
      )}
      {!recording && text.length !== 0 && (
        <div>
          <div className={`${styles.start_notice}`}>
            {`스크립트 출력이 끝났습니다.\n이용해주셔서 감사합니다.`}
          </div>
          <div style={{ marginTop: '30px' }} />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default RealtimeAudio;
