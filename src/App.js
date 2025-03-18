import React, { useState, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import InquiryDetail from "./components/InquiryDetail";
import NoticeScreen from "./components/NoticeScreen";

function Layout() {
  const [showNotice, setShowNotice] = useState(() => {
    return sessionStorage.getItem("isReloaded") ? false : true;
  });

  const location = useLocation();

  useEffect(() => {
    if (!sessionStorage.getItem("isReloaded")) {
      sessionStorage.setItem("isReloaded", "true");
      setShowNotice(true);
    }
  }, []);

  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "/login" && location.pathname !== "/signup") {
      setShowNotice(false);
    }
  }, [location.pathname]);

  return (
    <Routes>
      {showNotice ? (
        <Route
          path="/*"
          element={
            <NoticeScreen
              onContinue={() => {
                setShowNotice(false);
              }}
            />
          }
        />
      ) : (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/inquiry/:id" element={<InquiryDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout />
      </Router>
    </ThemeProvider>
  );
}

export default App;
