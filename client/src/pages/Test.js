import RealtimeAudio from '../components/RealtimeAudio';
import { Link } from 'react-router-dom';

function Test() {
  return (
    <div>
      <RealtimeAudio />
      <Link to="/">홈으로 </Link>
    </div>
  );
}

export default Test;
