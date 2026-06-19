import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivacyPage';
import CardFlipGame from './games/card-flip';
import SimonGame from './games/simon-says';
import NumberSequenceGame from './games/number-sequence';
import ObjectDisappearsGame from './games/object-disappears';
import WordRecallGame from './games/word-recall';
import PatternCopyGame from './games/pattern-copy';
import PositionGridGame from './games/position-grid';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/card-flip" element={<CardFlipGame />} />
        <Route path="/games/simon-says" element={<SimonGame />} />
        <Route path="/games/number-sequence" element={<NumberSequenceGame />} />
        <Route path="/games/object-disappears" element={<ObjectDisappearsGame />} />
        <Route path="/games/word-recall" element={<WordRecallGame />} />
        <Route path="/games/pattern-copy" element={<PatternCopyGame />} />
        <Route path="/games/position-grid" element={<PositionGridGame />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
