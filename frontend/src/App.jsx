import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ThirteenGamePage from './games/thirteen/pages/ThirteenGamePage';
import ComparisonPage from './games/thirteen/pages/ComparisonPage';
import EightGamePage from './games/eight/pages/EightGamePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/thirteen" element={<ThirteenGamePage />} />
      <Route path="/thirteen/comparison" element={<ComparisonPage />} />
      <Route path="/eight" element={<EightGamePage />} />
    </Routes>
  );
}

export default App;
