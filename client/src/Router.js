import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './pages/App';
import Test from './pages/Test';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
