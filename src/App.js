import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import InquiryDetail from "./components/InquiryDetail";

function App() {
  const [darkMode, setDarkMode] = useState(false); // 🔹 다크 모드 상태 추가

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/inquiry/:id" element={<InquiryDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
