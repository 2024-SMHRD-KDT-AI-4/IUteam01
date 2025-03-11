import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Switch,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

import ChartSection from "./ChartSection";
import NewsSection from "./NewsSection";
import InquirySection from "./InquirySection";
import FortuneSection from "./FortuneSection";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ================================
   1) 거래소 정보를 표로 표시하는 컴포넌트
=============================== */
function ExchangeInfoSection() {
  const exchanges = [
    { name: "고팍스", url: "https://www.gopax.co.kr", logo: "/logos/gopax.png" },
    { name: "빗썸", url: "https://www.bithumb.com", logo: "/logos/bithumb.png" },
    { name: "업비트", url: "https://upbit.com", logo: "/logos/upbit.png" },
    { name: "코인원", url: "https://coinone.co.kr", logo: "/logos/coinone.png" },
    { name: "코빗", url: "https://www.korbit.co.kr", logo: "/logos/korbit.png" },
    { name: "BitMEX", url: "https://www.bitmex.com/", logo: "/logos/bitmex.png" },
    { name: "Bittrex", url: "https://bittrexglobal.com/", logo: "/logos/bittrex.png" },
    { name: "Coinbase", url: "https://www.coinbase.com/", logo: "/logos/coinbase.png" },
    { name: "Kraken", url: "https://www.kraken.com/", logo: "/logos/kraken.png" },
    { name: "Poloniex", url: "https://poloniex.com/ko/", logo: "/logos/poloniex.png" }
  ];

  return (
    <TableContainer component={Paper} sx={{ margin: "1rem auto", maxWidth: 900 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
            <TableCell align="center" sx={{ fontWeight: "bold", width: "20%" }}>
              로고
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", width: "40%" }}>
              거래소
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", width: "40%" }}>
              사이트
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {exchanges.map((exchange, index) => (
            <TableRow key={index} sx={{ minHeight: 80 }}>
              <TableCell align="center">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "80px"
                  }}
                >
                  <img
                    src={exchange.logo}
                    alt={exchange.name}
                    style={{ width: "80px", height: "auto" }}
                  />
                </Box>
              </TableCell>
              <TableCell align="center" sx={{ fontSize: "16px", fontWeight: "500" }}>
                {exchange.name}
              </TableCell>
              <TableCell align="center">
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => window.open(exchange.url, "_blank")}
                >
                  방문하기
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/* ================================
   2) 대시보드 (합본)
=============================== */
function Dashboard({ darkMode, setDarkMode }) {
  const [activeTab, setActiveTab] = useState("chart");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const nav = useNavigate();

  // 탭 변경 함수: 문의사항 탭 클릭 시 로그인 여부를 확인
  const handleTabChange = (tabName) => {
    if (tabName === "inquiry" && !window.localStorage.getItem("nick")) {
      alert("로그인이 필요합니다. 로그인 후 이용해주세요.");
      nav("/login");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setActiveTab(tabName);
      setLoading(false);
    }, 500);
  };

  const handleLogin = () => {
    nav("/login");
  };

  const handleSignUp = () => {
    nav("/signup");
  };

  const handleLogout = () => {
    localStorage.removeItem("nick");
    nav("/");
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
            {t("welcome")}
          </Typography>
          <Switch checked={darkMode} onChange={toggleDarkMode} color="default" />
          <Select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            sx={{ marginLeft: "16px", backgroundColor: "#008080", borderRadius: "5px" }}
          >
            <MenuItem value="ko" sx={{ color: "#1976d2" }}>🇰🇷 한국어</MenuItem>
            <MenuItem value="en" sx={{ color: "#ffa000" }}>🇺🇸 English</MenuItem>
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
          📩 {t("inquiry")}
        </Button>
        <Button
          variant={activeTab === "exchangeInfo" ? "contained" : "outlined"}
          onClick={() => handleTabChange("exchangeInfo")}
        >
          🏦 {t("exchangeInfo")}
        </Button>
      </Box>

      {/* 로딩 또는 탭 컨텐츠 */}
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
          {activeTab === "exchangeInfo" && <ExchangeInfoSection />}
        </Box>
      )}
    </Box>
  );
}

export default Dashboard;