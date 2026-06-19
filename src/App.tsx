import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivacyPage';
import SettingsPage from './pages/SettingsPage';
import CardFlipGame from './games/card-flip';
import SimonGame from './games/simon-says';
import NumberSequenceGame from './games/number-sequence';
import ObjectDisappearsGame from './games/object-disappears';
import WordRecallGame from './games/word-recall';
import PatternCopyGame from './games/pattern-copy';
import PositionGridGame from './games/position-grid';

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    const listenerPromise = CapApp.addListener('backButton', () => {
      if (locationRef.current.pathname === '/') {
        void CapApp.exitApp();
      } else {
        navigate('/');
      }
    });

    return () => {
      void listenerPromise.then((handle) => handle.remove());
    };
  }, [navigate]);

  return (
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
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
