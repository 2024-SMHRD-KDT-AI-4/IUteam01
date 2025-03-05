// src/components/Dashboard.js
import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

import ChartSection from "./ChartSection";
import NewsSection from "./NewsSection";
import InquirySection from "./InquirySection"; // 문의사항 컴포넌트 추가

function Dashboard({ darkMode, setDarkMode }) {
  const [activeTab, setActiveTab] = useState("chart");
  const [searchTerm, setSearchTerm] = useState("");

  // 탭 전환 함수
  const handleTabChange = (tabName) => {
    if (tabName === "fortune") {
      // "운세" 탭 클릭 시 새 탭으로 외부 URL 열기
      window.open(
        "https://search.naver.com/search.naver?sm=tab_hty.top&where=nexearch&ssc=tab.nx.all&query=%EC%98%A4%EB%8A%98%EC%9D%98+%EC%9A%B4%EC%84%B8&oquery=%EB%84%A4%EC%9D%B4%EB%B2%84+%EC%9A%B4%EC%84%B8&tqi=i8jThlqo1e8ssCtQNr4sssssttl-487198",
        "_blank"
      );
      return; // 상태 업데이트 없이 바로 새 탭으로 이동
    }
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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* 상단 AppBar */}
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

      {/* 탭 버튼들 */}
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
          variant="outlined"
          onClick={() => handleTabChange("fortune")}
        >
          🔮 운세
        </Button>

        {/* "커뮤니티" 대신 "문의사항" 탭 추가 */}
        <Button
          variant={activeTab === "inquiry" ? "contained" : "outlined"}
          onClick={() => handleTabChange("inquiry")}
        >
          문의사항
        </Button>
      </Box>

      {/* 탭 내용 렌더링 */}
      <Box sx={{ padding: "1rem" }}>
        {activeTab === "chart" && <ChartSection />}
        {activeTab === "news" && <NewsSection />}
        {/* 운세 탭은 클릭 시 새 탭으로 이동하므로 별도 렌더링 없음 */}
        {activeTab === "inquiry" && <InquirySection />}
      </Box>
    </Box>
  );
}

export default Dashboard;
