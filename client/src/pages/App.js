import UploadAudio from '../components/UploadAudio';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div>
      <UploadAudio />
      <Link to="/test">테스트로 </Link>
    </div>
  );
}

export default App;
