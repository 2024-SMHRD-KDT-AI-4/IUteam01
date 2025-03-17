// import React, { useState, useMemo } from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
// import Dashboard from "./components/Dashboard";
// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import InquiryDetail from "./components/InquiryDetail";
// import NoticeScreen from "./components/NoticeScreen";

// function App() {
//   const [darkMode, setDarkMode] = useState(false);
//   const [showNotice, setShowNotice] = useState(() => {
//     // 로컬 스토리지에 "noticeSeen" 값이 없으면 공지 화면을 보여줌
//     return localStorage.getItem("noticeSeen") !== "true";
//   });

//   const theme = useMemo(
//     () =>
//       createTheme({
//         palette: {
//           mode: darkMode ? "dark" : "light",
//         },
//       }),
//     [darkMode]
//   );

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Router>
//         <Routes>
//           {showNotice && (
//             // 모든 경로에 대해 공지 화면을 우선 렌더링
//             <Route
//               path="*"
//               element={
//                 <NoticeScreen
//                   onContinue={() => {
//                     localStorage.setItem("noticeSeen", "true");
//                     setShowNotice(false);
//                   }}
//                 />
//               }
//             />
//           )}
//           <Route path="/" element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/inquiry/:id" element={<InquiryDetail />} />
//         </Routes>
//       </Router>
//     </ThemeProvider>
//   );
// }

// export default App;
import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import InquiryDetail from "./components/InquiryDetail";
import NoticeScreen from "./components/NoticeScreen";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showNotice, setShowNotice] = useState(true);

  // MUI 다크 모드 테마 생성
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
        <Routes>
          {showNotice ? (
            // showNotice가 true이면 모든 경로에 대해 NoticeScreen을 렌더링
            <Route
              path="/*"
              element={<NoticeScreen onContinue={() => setShowNotice(false)} />}
            />
          ) : (
            // showNotice가 false가 되면 나머지 라우트가 정상 동작
            <>
              <Route
                path="/"
                element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/inquiry/:id" element={<InquiryDetail />} />
              {/* 등록되지 않은 경로는 Dashboard로 리다이렉트 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
