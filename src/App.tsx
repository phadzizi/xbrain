import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CardFlipGame from './games/card-flip';
import SimonGame from './games/simon-says';
import NumberSequenceGame from './games/number-sequence';
import ObjectDisappearsGame from './games/object-disappears';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/card-flip" element={<CardFlipGame />} />
        <Route path="/games/simon-says" element={<SimonGame />} />
        <Route path="/games/number-sequence" element={<NumberSequenceGame />} />
        <Route path="/games/object-disappears" element={<ObjectDisappearsGame />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
