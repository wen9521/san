import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ThirteenGamePage from './pages/ThirteenGamePage';
import ComparisonPage from './pages/ComparisonPage';
import RoomSelectionPage from './pages/RoomSelectionPage';
import EightGamePage from './pages/EightGamePage';
import { GameProvider as ThirteenGameProvider } from './context/GameContext'; // 重命名以区分
import { EightGameProvider } from './context/EightGameContext'; // 【新增】引入八张游戏Context

// 十三张游戏布局
const ThirteenGameLayout = () => (
  <ThirteenGameProvider>
    <Routes>
      <Route path="play" element={<ThirteenGamePage />} />
      <Route path="comparison" element={<ComparisonPage />} />
    </Routes>
  </ThirteenGameProvider>
);

// 【核心改造】: 八张游戏布局现在使用自己的Provider
const EightGameLayout = () => (
    <EightGameProvider>
        <Routes>
            <Route path="play" element={<EightGamePage />} />
            {/* <Route path="comparison" element={<EightComparisonPage />} /> */}
        </Routes>
    </EightGameProvider>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/rooms" element={<RoomSelectionPage />} />
      
      <Route path="/thirteen/*" element={<ThirteenGameLayout />} />
      <Route path="/eight/*" element={<EightGameLayout />} />

    </Routes>
  );
}

export default App;
