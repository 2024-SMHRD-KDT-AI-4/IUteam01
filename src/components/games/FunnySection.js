import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import "./FunnySection.css";
import RPSGame from "./RPSGame";
import SlotMachine from "./SlotMachine";
import Hangman from "./Hangman";
import MemoryGame from "./MemoryGame";
import ClickGame from "./ClickGame";
import CoinQuiz from "./CoinQuiz"

// 운세 카드 영역: 3x3 그리드로 운세를 보여줌
function FortuneCards() {
  const { t, i18n } = useTranslation();

  // 투자 운세 (12개)
  const fortunesKR = [
    "📈 오늘은 상승장이 예상됩니다! 기회를 잡아보세요!",
    "📉 조정이 올 수 있습니다. 냉정함을 유지하세요.",
    "💡 새로운 투자 아이디어가 떠오를 수 있어요!",
    "🚀 강한 상승세가 보이는 종목이 있을지도 몰라요!",
    "💰 분산 투자가 리스크를 줄이는 열쇠입니다.",
    "🔍 시장을 더 분석해 보면 좋은 기회를 찾을 수 있어요.",
    "⚠️ 감정적인 매매를 피하세요. 냉정함이 중요합니다.",
    "📊 지표 분석을 통해 전략을 세우세요.",
    "💎 저평가된 종목을 찾으면 기회가 될 수 있어요!",
    "🔺 손절매 전략을 미리 설정해 두는 것이 중요합니다.",
    "📢 시장 뉴스에 귀 기울이세요. 트렌드가 보일 거예요.",
    "🎯 장기적인 시야를 가지고 투자하는 것이 핵심입니다."
  ];

  const fortunesEN = [
    "📈 A bullish market may be ahead! Seize the opportunity!",
    "📉 A correction might come. Stay calm and strategic.",
    "💡 You might come up with a new investment idea today!",
    "🚀 A stock with strong momentum could be emerging!",
    "💰 Diversifying your portfolio is key to reducing risk.",
    "🔍 A deeper market analysis may reveal hidden gems.",
    "⚠️ Avoid emotional trading. Keep a level head.",
    "📊 Use technical indicators to strategize your moves.",
    "💎 Finding undervalued stocks can be a great opportunity!",
    "🔺 Set stop-loss strategies in advance.",
    "📢 Stay updated with market news. Trends are emerging!",
    "🎯 Think long-term for sustainable investment success."
  ];

  const fortunes = i18n.language === "ko" ? fortunesKR : fortunesEN;

  // 상태: 선택한 카드, 각 카드에 할당된 운세, 남은 운세
  const [selectedCards, setSelectedCards] = useState(Array(9).fill(null));
  const [cardFortunes, setCardFortunes] = useState(Array(9).fill(""));
  const [availableFortunes, setAvailableFortunes] = useState([...fortunes]);

  const handleCardClick = (index) => {
    // 이미 선택된 카드거나 남은 운세가 없으면 리턴
    if (selectedCards[index] !== null || availableFortunes.length === 0) return;

    // 남은 운세 중 랜덤하게 하나 선택
    const randomIndex = Math.floor(Math.random() * availableFortunes.length);
    const chosenFortune = availableFortunes[randomIndex];

    // 사용한 운세 제거
    const newAvailableFortunes = availableFortunes.filter((_, i) => i !== randomIndex);

    const updatedSelected = [...selectedCards];
    const updatedCardFortunes = [...cardFortunes];

    updatedSelected[index] = true;
    updatedCardFortunes[index] = chosenFortune;

    setSelectedCards(updatedSelected);
    setAvailableFortunes(newAvailableFortunes);

    // 딜레이 후 운세 업데이트 (애니메이션 효과 고려)
    setTimeout(() => setCardFortunes(updatedCardFortunes), 500);
  };

  const handleReset = () => {
    setSelectedCards(Array(9).fill(null));
    setCardFortunes(Array(9).fill(""));
    setAvailableFortunes([...fortunes]);
  };

  return (
    <div className="fortune-container">
      <h2>🔮 {t("choose")}</h2>
      <div className="card-container">
        {[...Array(9)].map((_, index) => (
          <div
            key={index}
            className={`card ${selectedCards[index] ? "flipped" : ""}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">📊</div>
              <div className="card-back">{cardFortunes[index]}</div>
            </div>
          </div>
        ))}
      </div>
      {selectedCards.every((card) => card !== null) && (
        <button className="reset-button" onClick={handleReset}>
          🔄 다시하기
        </button>
      )}
    </div>
  );
}

function FunnySection() {
  // 하위 탭 상태: 0: 운세 카드, 1: 가위바위보, 2: 슬롯머신
  const [subTab, setSubTab] = useState(0);

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
  };

  return (
    <Box>
      {/* 하위 탭 메뉴 */}
      <Tabs
        value={subTab}
        onChange={handleSubTabChange}
        variant="fullWidth"
        centered
      >
        <Tab label="운세 카드(fortunecard)" />
        <Tab label="가위바위보(rock-paper-scissors)" />
        <Tab label="슬롯머신(slotmachine)" />
        <Tab label="행맨(Hangman)" />
        <Tab label="메모리게임(MemoryGame)" />
        <Tab label="클릭게임(ClickGame)" />
        <Tab label="코인퀴즈(CoinQuiz)" />
      </Tabs>

      {/* 탭별 콘텐츠 전환 */}
      {subTab === 0 && <FortuneCards />}
      {subTab === 1 && <RPSGame />}
      {subTab === 2 && <SlotMachine />}
      {subTab === 3 && <Hangman />}
      {subTab === 4 && <MemoryGame />}
      {subTab === 5 && <ClickGame />}
      {subTab === 6 && <CoinQuiz />}
    </Box>
  );
}

export default FunnySection;
