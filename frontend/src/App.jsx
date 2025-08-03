import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
// Game-specific layouts will be imported here later

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* 
        The routes for games will be added here, for example:
        <Route path="/thirteen/*" element={<ThirteenGameLayout />} />
        <Route path="/eight/*" element={<EightGameLayout />} />
      */}
    </Routes>
  );
}

export default App;
