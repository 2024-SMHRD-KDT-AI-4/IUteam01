// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import NoticeScreen from "./components/NoticeScreen";
import Dashboard from "./components/Dashboard";
import CommunityList from "./components/CommunityList";
import PostDetail from "./components/PostDetail";
import PostWrite from "./components/PostWrite";

function App() {
  const [showNotice, setShowNotice] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // 다크모드 상태

  // 50초 후 자동으로 주의사항 해제
  useEffect(() => {
    const timer = setTimeout(() => setShowNotice(false), 50000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    setShowNotice(false);
  };

  // 다크/라이트 테마 생성
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? "#121212" : "#f0f0f0",
        paper: darkMode ? "#1d1d1d" : "#fff",
      },
    },
  });

  if (showNotice) {
    // 주의사항 화면
    return <NoticeScreen handleContinue={handleContinue} />;
  }

  // 주의사항이 끝나면 라우팅 + 전역 테마 적용
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          {/* Dashboard에 darkMode, setDarkMode 넘겨서 내부 버튼으로 토글 가능 */}
          <Route
            path="/"
            element={
              <Dashboard
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          />
          <Route path="/community" element={<CommunityList />} />
          <Route path="/community/write" element={<PostWrite />} />
          <Route path="/community/:id" element={<PostDetail />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
