import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RoomSelectionPage from './pages/RoomSelectionPage';

// Import game-specific components
import ThirteenGamePage from './games/thirteen/pages/ThirteenGamePage';
import ComparisonPage from './games/thirteen/pages/ComparisonPage';
import { GameProvider as ThirteenGameProvider } from './games/thirteen/context/GameContext';

import EightGamePage from './games/eight/pages/EightGamePage';
import { EightGameProvider } from './games/eight/context/EightGameContext';

// Import Auth provider
import { AuthProvider } from './context/AuthContext';

const ThirteenGameLayout = () => (
  <ThirteenGameProvider>
    <Routes>
      <Route path="play" element={<ThirteenGamePage />} />
      <Route path="comparison" element={<ComparisonPage />} />
    </Routes>
  </ThirteenGameProvider>
);

const EightGameLayout = () => (
    <EightGameProvider>
        <Routes>
            <Route path="play" element={<EightGamePage />} />
        </Routes>
    </EightGameProvider>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomSelectionPage />} />
        
        {/* Route groups for each game */}
        <Route path="/thirteen/*" element={<ThirteenGameLayout />} />
        <Route path="/eight/*" element={<EightGameLayout />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;
