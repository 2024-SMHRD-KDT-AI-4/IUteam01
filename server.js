// server.js
const express = require("express");
const path = require("path");
const app = express();

// 빌드된 React 정적 파일 제공
app.use(express.static(path.join(__dirname, "build")));

// SPA 특성상, 모든 라우트(*)에 대해 index.html을 제공
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// 포트 설정
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
