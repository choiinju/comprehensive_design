import React, { useState } from 'react';
import axios from 'axios';

const UploadAudio = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [text, setText] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadFile = () => {
    const formData = new FormData();
    formData.append('audio', selectedFile);

    axios
      .post('http://localhost:8000/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setText(res?.data ?? 'Sorry, Failed...');
        console.log('Success');
      })
      .catch((error) => {
        console.error('Error: ', error);
      });
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUploadFile}>Upload</button>
      <div>{text}</div>
    </div>
  );
};

export default UploadAudio;
