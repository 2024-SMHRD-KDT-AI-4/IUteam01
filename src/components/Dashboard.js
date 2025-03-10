// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Switch,
  Select,
  MenuItem
} from "@mui/material";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

import ChartSection from "./ChartSection";
import NewsSection from "./NewsSection";
import InquirySection from "./InquirySection";
import FortuneSection from "./FortuneSection";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

function Dashboard({ darkMode, setDarkMode }) {
  const [activeTab, setActiveTab] = useState("chart");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // 만약 URL state로 activeTab이 전달되면 해당 탭을 활성화
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // 탭 변경 함수: 문의사항 탭 클릭 시 로그인 여부 확인
  const handleTabChange = (tabName) => {
    if (tabName === "inquiry" && !window.localStorage.getItem("nick")) {
      alert("로그인이 필요합니다. 로그인 후 이용해주세요.");
      navigate("/login");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setActiveTab(tabName);
      setLoading(false);
    }, 500);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleLogout = () => {
    localStorage.removeItem("nick");
    navigate("/");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {t("welcome")}
          </Typography>
          <Switch checked={darkMode} onChange={toggleDarkMode} color="default" />
          <Select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            sx={{ marginLeft: "16px", backgroundColor: "white", borderRadius: "5px" }}
          >
            <MenuItem value="ko">🇰🇷 한국어</MenuItem>
            <MenuItem value="en">🇺🇸 English</MenuItem>
          </Select>
          {window.localStorage.getItem("nick") ? (
            <div>
              <h1>{window.localStorage.getItem("nick")}님 환영합니다</h1>
              <Button color="inherit" onClick={handleLogout}>
                로그아웃
              </Button>
            </div>
          ) : (
            <div>
              <Button color="inherit" onClick={handleLogin}>
                로그인
              </Button>
              <Button color="inherit" onClick={handleSignUp}>
                회원가입
              </Button>
            </div>
          )}
        </Toolbar>
      </AppBar>

      {/* 탭 버튼 */}
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

      {loading ? (
        <Typography sx={{ textAlign: "center", marginTop: "20px" }}>
          ⏳ Loading...
        </Typography>
      ) : (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          sx={{ padding: "1rem" }}
        >
          {activeTab === "chart" && <ChartSection />}
          {activeTab === "news" && <NewsSection />}
          {activeTab === "fortune" && <FortuneSection />}
          {activeTab === "inquiry" && <InquirySection />}
        </Box>
      )}
    </Box>
  );
}

export default Dashboard;
