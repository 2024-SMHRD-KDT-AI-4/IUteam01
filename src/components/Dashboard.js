// src/components/Dashboard.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import ChartSection from "./ChartSection";
import NewsSection from "./NewsSection";
import FortuneSection from "./FortuneSection";

// props로 darkMode, setDarkMode 받음
function Dashboard({ darkMode, setDarkMode }) {
  const [activeTab, setActiveTab] = useState("chart");
  const [searchTerm, setSearchTerm] = useState("");

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`검색어: ${searchTerm}`);
  };

  const handleLogin = () => {
    window.open("/login.html", "loginWindow", "width=400,height=500");
  };

  const handleSignUp = () => {
    window.open("/signup.html", "signupWindow", "width=400,height=500");
  };

  // Dashboard 내부에서는 다크모드 상태를 직접 관리하지 않고
  // App.js에서 내려준 setDarkMode를 사용
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI Coin Helper
          </Typography>
          <form onSubmit={handleSearchSubmit} style={{ marginRight: "16px" }}>
            <input
              type="text"
              placeholder="검색어"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginRight: "8px" }}
            />
            <Button variant="contained" color="secondary" type="submit">
              검색
            </Button>
          </form>
          <Button color="inherit" onClick={toggleDarkMode}>
            {darkMode ? "라이트모드" : "다크모드"}
          </Button>
          <Button color="inherit" onClick={handleLogin}>
            로그인
          </Button>
          <Button color="inherit" onClick={handleSignUp}>
            회원가입
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: "1rem", display: "flex", gap: "1rem" }}>
        <Button
          variant={activeTab === "chart" ? "contained" : "outlined"}
          onClick={() => handleTabChange("chart")}
        >
          📈 차트
        </Button>
        <Button
          variant={activeTab === "news" ? "contained" : "outlined"}
          onClick={() => handleTabChange("news")}
        >
          📰 뉴스
        </Button>
        <Button
          variant={activeTab === "fortune" ? "contained" : "outlined"}
          onClick={() => handleTabChange("fortune")}
        >
          🔮 운세
        </Button>
        <Link to="/community" style={{ textDecoration: "none" }}>
          <Button variant="outlined">커뮤니티</Button>
        </Link>
      </Box>

      <Box sx={{ padding: "1rem" }}>
        {activeTab === "chart" && <ChartSection />}
        {activeTab === "news" && <NewsSection />}
        {activeTab === "fortune" && <FortuneSection />}
      </Box>
    </Box>
  );
}

export default Dashboard;
