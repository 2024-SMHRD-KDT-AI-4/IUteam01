// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import NoticeScreen from "./components/NoticeScreen";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";

function App() {
  const [showNotice, setShowNotice] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowNotice(false), 50000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    setShowNotice(false);
  };

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
    return <NoticeScreen handleContinue={handleContinue} />;
  }

  // 주의사항이 끝난 후에 렌더링할 내용 추가 (예: 대시보드)
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />}
          />
           <Route path="/login" element={<Login />} />
           <Route path="/signup" element={<Signup />} />
        </Routes>
       
      </Router>
    </ThemeProvider>
  );
}

export default App;
