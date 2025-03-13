// i18n.js (전체 예시)

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      welcome: "Welcome to AI Coin Helper",
      chart: "CHART",
      news: "NEWS",
      community: "COMMUNITY",
      fortune: "Any worries?",
      login: "LOGIN",
      signUp: "SIGN UP",
      darkMode: "DARK MODE",
      lightMode: "LIGHT MODE",
      searchPlaceholder: "Search...",
      search: "SEARCH",
      momentNow: "This is the moment", 
      exchangeInfo: "Exchange Info",
      choose: "Choose a Stock Fortune Card!"
    },
  },
  ko: {
    translation: {
      welcome: "AI 코인 헬퍼에 오신 것을 환영합니다",
      chart: "차트",
      news: "뉴스",
      community: "커뮤니티",
      fortune: "고민이 되나요?",
      login: "로그인",
      signUp: "회원가입",
      darkMode: "다크모드",
      lightMode: "라이트모드",
      searchPlaceholder: "검색어",
      exchangeInfo: "거래소 정보",
      search: "검색",
      choose: "오늘의 주식 운명을 점쳐볼 카드 한 장을 선택하세요!",
      momentNow: "지금 이순간", 
    },
  },
};

i18n
  .use(initReactI18next) 
  .init({
    resources,
    lng: "ko",
    fallbackLng: "ko",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
