// src/components/Dashboard.js
import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useTranslation } from "react-i18next"; // i18n Hook 가져오기
import i18n from "../i18n"; // i18n 직접 import
import ChartSection from "./ChartSection";
import NewsSection from "./NewsSection";
import InquirySection from "./InquirySection";

function Dashboard({ darkMode, setDarkMode }) {
  // 탭 상태(차트/뉴스/운세/문의사항)
  const [activeTab, setActiveTab] = useState("chart");
  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState("");

  // i18n (언어 전환, 번역)
  const { t } = useTranslation();

  // 언어 토글 (국기 클릭 시)
  const toggleLanguage = () => {
    const newLang = i18n.language === "ko" ? "en" : "ko";
    i18n.changeLanguage(newLang);
  };

  // 운세 탭 클릭 시 → 새 탭으로 이동
  const handleTabChange = (tabName) => {
    if (tabName === "fortune") {
      window.open(
        "https://search.naver.com/search.naver?sm=tab_hty.top&where=nexearch&ssc=tab.nx.all&query=%EC%98%A4%EB%8A%98%EC%9D%98+%EC%9A%B4%EC%84%B8",
        "_blank"
      );
      return;
    }
    setActiveTab(tabName);
  };

  // 검색 제출
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`검색어: ${searchTerm}`);
  };

  // 로그인/회원가입 팝업
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
          {/* i18n 번역 */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t("welcome")}
          </Typography>

          {/* 검색 폼 */}
          <form onSubmit={handleSearchSubmit} style={{ marginRight: "16px" }}>
            <input
              type="text"
              placeholder={t("searchPlaceholder") || "검색어"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginRight: "8px" }}
            />
            <Button variant="contained" color="secondary" type="submit">
              {t("search") || "검색"}
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
        <Button variant="outlined" onClick={() => handleTabChange("fortune")}>
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
        {activeTab === "inquiry" && <InquirySection />}
      </Box>
    </Box>
  );
}

export default Dashboard;
