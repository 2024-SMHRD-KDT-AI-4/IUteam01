// src/components/FortuneSection.jsx

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function FortuneSection() {
  const { t, i18n } = useTranslation();

  // 한국어 운세 목록
  const fortunesKR = [
    // 긍정적인 운세
    "오늘은 새로운 기회가 생길 수도 있어요!",
    "뜻밖의 행운이 찾아올 수도 있습니다.",
    "마음속 소원이 이루어질 가능성이 높아요!",
    "노력이 결실을 맺는 하루가 될 거예요.",
    "주변 사람들에게 감사함을 표현하면 더 좋은 일이 생길 거예요.",
    "오래 기다리던 일이 드디어 해결될 수 있어요.",
    "새로운 사람들과의 만남이 행운을 가져다줄 거예요.",
    "평소 하고 싶었던 일을 시작하기 좋은 날이에요!",
    "오늘은 원하는 것을 얻을 수 있는 좋은 날입니다.",
    "행복한 순간이 찾아올 것이니 기대해보세요!",
    "자신감을 갖고 도전하면 좋은 결과가 따라올 거예요.",
    "긍정적인 마음이 오늘 하루를 더 밝게 만들 거예요.",
    "어려운 문제도 의외로 쉽게 해결될 수 있습니다.",
    "하늘이 돕는 날! 하고 싶은 일을 적극적으로 추진해 보세요.",
    "모든 일이 순조롭게 진행될 가능성이 높습니다.",

    // 중립적인 운세
    "침착함을 유지하면 좋은 결과를 얻을 수 있어요.",
    "오늘은 신중하게 행동하는 것이 좋습니다.",
    "하루를 차분하게 보내며 내면을 돌아보는 시간을 가져보세요.",
    "작은 변화가 큰 차이를 만들 수도 있습니다.",
    "새로운 도전을 준비하기 좋은 날이에요.",
    "기회는 준비된 자에게 찾아옵니다. 오늘을 의미 있게 보내세요.",
    "가벼운 산책이 좋은 아이디어를 떠올리게 해줄 수 있어요.",
    "오늘은 책을 읽거나 조용한 시간을 가지는 것도 좋습니다.",
    "잠시 멈추고 주변을 돌아보면 새로운 깨달음을 얻을 수 있어요.",
    "내일을 위해 오늘을 정리하는 시간을 가져보세요.",
    "주변의 작은 변화가 큰 영향을 미칠 수 있습니다.",
    "새로운 계획을 세우기에 적절한 시기입니다.",
    "급하게 결정하지 말고 천천히 생각해보는 것이 좋아요.",
    "조용히 휴식을 취하면 더 좋은 하루를 만들 수 있습니다.",

    // 주의해야 할 운세
    "뜻밖의 지출에 주의하세요.",
    "과신하지 말고 신중하게 결정하는 것이 필요합니다.",
    "감정을 조절하지 않으면 불필요한 다툼이 생길 수 있어요.",
    "오늘은 중요한 결정을 미루는 것이 좋을 수도 있습니다.",
    "급하게 움직이면 실수를 초래할 수 있어요.",
    "무리한 계획은 피하고 현실적인 목표를 설정하세요.",
    "주변의 이야기를 경청하면 예상치 못한 도움을 받을 수 있어요.",
    "건강을 위해 충분한 휴식을 취하는 것이 중요합니다.",
    "오늘은 너무 많은 것을 욕심내지 않는 것이 좋아요.",
    "작은 실수가 큰 결과를 초래할 수 있으니 주의하세요.",
    "일이 뜻대로 풀리지 않더라도 조급해하지 마세요.",
    "계획을 다시 점검하고, 서두르지 않는 것이 중요합니다.",
    "조금 더 신중한 태도가 당신을 도울 것입니다.",
    "스트레스를 받을 수 있는 상황이 생길 수 있으니 미리 대비하세요.",
    "잘못된 정보를 듣고 오해가 생길 수 있으니 확인이 필요해요.",
    "예상치 못한 변화가 있을 수 있으니 유연하게 대처하세요.",
    "금전적인 문제를 신중히 다루는 것이 중요한 하루입니다.",
  ];

  // 위 배열과 1:1 매칭되는 영어 운세 목록
  const fortunesEN = [
    // Positive
    "A new opportunity may come your way today!",
    "Unexpected luck could arrive.",
    "A long-held wish might come true!",
    "Your efforts will bear fruit today.",
    "Expressing gratitude to those around you may lead to better fortune.",
    "Something you've been waiting for may finally be resolved.",
    "Meeting new people may bring you good luck.",
    "It's a great day to start something you've always wanted to do!",
    "You may get what you want today.",
    "Look forward to a moment of happiness!",
    "If you challenge yourself with confidence, you'll see good results.",
    "A positive mindset will brighten your day.",
    "Even tough problems could be solved more easily than you expect.",
    "The heavens are on your side—push forward with your plans!",
    "Everything is likely to go smoothly today.",

    // Neutral
    "Staying calm will help you achieve good outcomes.",
    "Acting cautiously might be best today.",
    "Take a day to slow down and reflect inwardly.",
    "A small change can make a big difference.",
    "It's a good day to prepare for new challenges.",
    "Opportunities come to those who are ready. Make the most of today.",
    "A light walk may spark a great idea.",
    "Reading or enjoying quiet time could be beneficial today.",
    "Pause for a moment and look around; you might gain new insights.",
    "Take some time to organize today for a better tomorrow.",
    "Minor changes in your surroundings can have a big impact.",
    "It's a suitable time to set new plans.",
    "Avoid rushing major decisions; think it through slowly.",
    "Taking quiet rest can lead to an even better day.",

    // Cautions
    "Watch out for unexpected expenses.",
    "Don't be overconfident; careful decisions are necessary.",
    "Uncontrolled emotions may cause unnecessary conflicts.",
    "It might be wise to delay important decisions today.",
    "Moving too quickly can lead to mistakes.",
    "Avoid unrealistic plans and set achievable goals.",
    "Listening carefully to others may bring unexpected help.",
    "Remember to get enough rest for your health.",
    "Avoid being too greedy today.",
    "A small mistake could have big consequences, so be cautious.",
    "Even if things don't go as planned, don't be hasty.",
    "Review your plans and don't rush any steps.",
    "A more careful approach will benefit you.",
    "Prepare for possible stressful situations in advance.",
    "Incorrect information can lead to misunderstandings, so verify details.",
    "Unforeseen changes may occur; stay flexible.",
    "Handle financial matters carefully—it's important today.",
  ];

  // 운세를 뽑기 위한 index
  const [fortuneIndex, setFortuneIndex] = useState(0);

  // 컴포넌트 마운트 시 랜덤 index 생성
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * fortunesKR.length);
    setFortuneIndex(randomIndex);
  }, []);

  // 언어(i18n.language)가 "ko"면 한글 운세, "en"이면 영어 운세
  const fortuneText =
    i18n.language === "ko"
      ? fortunesKR[fortuneIndex]
      : fortunesEN[fortuneIndex];

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🔮 {t("momentNow")}</h2> {/* ← "지금 이순간" / "This is the moment" */}
      <p>{fortuneText}</p>
    </div>
      );
    }

export default FortuneSection;
