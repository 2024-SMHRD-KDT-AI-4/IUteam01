// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useTranslation } from "react-i18next"; 
import i18n from "../i18n"; // 위에서 만든 i18n.js 파일
import ChartSection from "./ChartSection";
import NewsSection from "./NewsSection";
import InquirySection from "./InquirySection";
import FortuneSection from "./FortuneSection";

function Dashboard({ darkMode, setDarkMode }) {
  // 탭 상태("chart", "news", "fortune", "inquiry")
  const [activeTab, setActiveTab] = useState("chart");
  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState("");

  // i18n 훅 (번역)
  const { t } = useTranslation();

  // "fortune" 문자열만 따로 관리해서 강제 업데이트할 수도 있음
  // 지금은 따로 useState 안 쓰고, t("fortune")을 직접 사용해도 됨.
  // 필요하다면 아래와 같이 쓰면 됨:
  //
  // const [fortuneText, setFortuneText] = useState(t("fortune"));
  // useEffect(() => {
  //   setFortuneText(t("fortune"));
  // }, [i18n.language]);

  // 언어 토글
  const toggleLanguage = () => {
    const newLang = i18n.language === "ko" ? "en" : "ko";
    i18n.changeLanguage(newLang);
  };

  // 탭 변경
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
  };

  // 검색 제출
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`검색어: ${searchTerm}`);
  };

  // 로그인 / 회원가입 팝업 예시
  const handleLogin = () => {
    window.open("/login.html", "loginWindow", "width=400,height=500");
  };

  const handleSignUp = () => {
    window.open("/signup.html", "signupWindow", "width=400,height=500");
  };

  // 다크모드 토글
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* 상단 AppBar */}
      <AppBar position="static">
        <Toolbar>
          {/* 좌측 타이틀 */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t("welcome")}
          </Typography>

          {/* 검색 폼 */}
          <form onSubmit={handleSearchSubmit} style={{ marginRight: "16px" }}>
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginRight: "8px" }}
            />
            <Button variant="contained" color="secondary" type="submit">
              {t("search")}
            </Button>
          </form>

          {/* 다크모드 토글 */}
          <Button color="inherit" onClick={toggleDarkMode}>
            {darkMode ? t("lightMode") : t("darkMode")}
          </Button>

          {/* 로그인/회원가입 */}
          <Button color="inherit" onClick={handleLogin}>
            {t("login")}
          </Button>
          <Button color="inherit" onClick={handleSignUp}>
            {t("signUp")}
          </Button>

          {/* 국기 버튼 (언어 전환) */}
          <img
            src={i18n.language === "ko" ? "/flag-us.png" : "/flag-kr.png"}
            alt="Toggle Language"
            style={{ width: "30px", cursor: "pointer", marginLeft: "16px" }}
            onClick={toggleLanguage}
          />
        </Toolbar>
      </AppBar>

      {/* 탭 버튼들 */}
      <Box sx={{ padding: "1rem", display: "flex", gap: "1rem" }}>
        <Button
          variant={activeTab === "chart" ? "contained" : "outlined"}
          onClick={() => handleTabChange("chart")}
        >
          📈 {t("chart")}
        </Button>
        <Button
          variant={activeTab === "news" ? "contained" : "outlined"}
          onClick={() => handleTabChange("news")}
        >
          📰 {t("news")}
        </Button>
        <Button
          variant={activeTab === "fortune" ? "contained" : "outlined"}
          onClick={() => handleTabChange("fortune")}
        >
          🔮 {t("fortune")}
        </Button>
        <Button
          variant={activeTab === "inquiry" ? "contained" : "outlined"}
          onClick={() => handleTabChange("inquiry")}
        >
          {t("inquiry")}
        </Button>
      </Box>

      {/* 탭 내용 렌더링 */}
      <Box sx={{ padding: "1rem" }}>
        {activeTab === "chart" && <ChartSection />}
        {activeTab === "news" && <NewsSection />}
        {activeTab === "fortune" && <FortuneSection />}
        {activeTab === "inquiry" && <InquirySection />}
      </Box>
    </Box>
  );
}

export default Dashboard;
