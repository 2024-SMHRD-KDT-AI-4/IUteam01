import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Switch, Select, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";
import i18n from "../i18n"; 
import ChartSection from "./ChartSection";
import NewsSection from "./NewsSection";
import InquirySection from "./InquirySection";
import FortuneSection from "./FortuneSection";
import { motion } from "framer-motion";

function Dashboard({ darkMode, setDarkMode }) {
  const [activeTab, setActiveTab] = useState("chart");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const { t } = useTranslation();

  const availableKeywords = ["Bitcoin", "Ethereum", "Crypto", "Stock", "Gold"];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 0) {
      setSuggestions(availableKeywords.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      ));
    } else {
      setSuggestions([]);
    }
  };

  const handleTabChange = (tabName) => {
    setLoading(true);
    setTimeout(() => {
      setActiveTab(tabName);
      setLoading(false);
    }, 500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`검색어: ${searchTerm}`);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{t("welcome")}</Typography>

          <form onSubmit={handleSearchSubmit} style={{ marginRight: "16px", position: "relative" }}>
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ marginRight: "8px" }}
            />
            <Button variant="contained" color="secondary" type="submit">{t("search")}</Button>

            {suggestions.length > 0 && (
              <Box sx={{ position: "absolute", background: "white", border: "1px solid #ccc", width: "100%", zIndex: 10 }}>
                {suggestions.map((item, index) => (
                  <Box key={index} sx={{ padding: "5px", cursor: "pointer" }} onClick={() => { setSearchTerm(item); setSuggestions([]); }}>
                    {item}
                  </Box>
                ))}
              </Box>
            )}
          </form>

          <Switch checked={darkMode} onChange={toggleDarkMode} color="default" />

          <Select value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}
            sx={{ marginLeft: "16px", backgroundColor: "white", borderRadius: "5px" }}>
            <MenuItem value="ko">🇰🇷 한국어</MenuItem>
            <MenuItem value="en">🇺🇸 English</MenuItem>
          </Select>
        </Toolbar>
      </AppBar>

      <Box sx={{ padding: "1rem", display: "flex", gap: "1rem" }}>
        <Button variant={activeTab === "chart" ? "contained" : "outlined"} onClick={() => handleTabChange("chart")}>
          📈 {t("chart")}
        </Button>
        <Button variant={activeTab === "news" ? "contained" : "outlined"} onClick={() => handleTabChange("news")}>
          📰 {t("news")}
        </Button>
        <Button variant={activeTab === "fortune" ? "contained" : "outlined"} onClick={() => handleTabChange("fortune")}>
          🔮 {t("fortune")}
        </Button>
        <Button variant={activeTab === "inquiry" ? "contained" : "outlined"} onClick={() => handleTabChange("inquiry")}>
          {t("inquiry")}
        </Button>
      </Box>

      {loading ? (
        <Typography sx={{ textAlign: "center", marginTop: "20px" }}>⏳ Loading...</Typography>
      ) : (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} sx={{ padding: "1rem" }}>
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
