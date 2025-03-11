import React, { useState, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import InquiryDetail from "./components/InquiryDetail";
import NoticeScreen from "./components/NoticeScreen";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showNotice, setShowNotice] = useState(true);

  // MUI 다크 모드 테마 생성
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? "dark" : "light",
      },
    }), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <InitialRedirect /> {/* 🚀 처음 접속 시 /notice로 이동 */}
        <Routes>
          <Route path="/notice" element={<NoticeScreen onContinue={() => setShowNotice(false)} />} />
          <Route path="/" element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/inquiry/:id" element={<InquiryDetail />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

// 🚀 초기 접속 시 자동으로 /notice로 이동
function InitialRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/notice");
  }, []);

  return null;
}

export default App;
