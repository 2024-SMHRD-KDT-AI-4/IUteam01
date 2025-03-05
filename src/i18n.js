import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome to AI Coin Helper",
      chart: "Chart",
      news: "News",
      inquiry: "Inquiry",
      fortune: "Fortune",
      login: "Login",
      signUp: "Sign Up",
      darkMode: "Dark Mode",
      lightMode: "Light Mode",
      searchPlaceholder: "Search...",
      search: "Search",
    },
  },
  ko: {
    translation: {
      welcome: "AI 코인 헬퍼에 오신 것을 환영합니다",
      chart: "차트",
      news: "뉴스",
      inquiry: "문의사항",
      fortune: "운세",
      login: "로그인",
      signUp: "회원가입",
      darkMode: "다크모드",
      lightMode: "라이트모드",
      searchPlaceholder: "검색어",
      search: "검색",
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ko", // 기본 언어 설정
    fallbackLng: "ko",
    interpolation: { escapeValue: false },
  });

export default i18n; // 여기서 i18n을 export해야 Dashboard.js에서 사용할 수 있음
