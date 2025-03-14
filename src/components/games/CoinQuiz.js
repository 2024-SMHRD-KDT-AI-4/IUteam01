import React, { useState } from 'react';
import './CoinQuiz.css';

const quizData = [
  {
    question: "비트코인은 몇 년에 처음 만들어졌나요?",
    options: ["2007년", "2008년", "2009년", "2010년"],
    answer: "2009년"
  },
  {
    question: "이더리움(Ethereum)을 만든 사람은 누구인가요?",
    options: ["비탈릭 부테린", "사토시 나카모토", "찰스 호스킨슨", "개빈 우드"],
    answer: "비탈릭 부테린"
  },
  {
    question: "코인베이스(Coinbase)가 만들어진 연도는?",
    options: ["2010년", "2012년", "2014년", "2016년"],
    answer: "2012년"
  },
  {
    question: "NFT는 무엇의 줄임말인가요?",
    options: ["대체 불가능 토큰", "비금융 거래", "새로운 미래 기술", "다음 재미 토큰"],
    answer: "대체 불가능 토큰"
  },
  {
    question: "비트코인 백서(whitepaper)의 제목은 무엇인가요?",
    options: [
      "비트코인: 개인 간 전자 화폐 시스템",
      "비트코인 프로토콜",
      "암호화폐 혁명",
      "디지털 화폐 혁명"
    ],
    answer: "비트코인: 개인 간 전자 화폐 시스템"
  },
  {
    question: "비트코인의 최대 발행량(총 공급량)은 얼마인가요?",
    options: [
      "2,100만 개",
      "4,200만 개",
      "5,000만 개",
      "1억 개"
    ],
    answer: "2,100만 개"
  },
  {
    question: "이더리움이 The Merge 이후 사용하는 방식은?",
    options: [
      "지분 증명 (Proof of Stake)",
      "작업 증명 (Proof of Work)",
      "위임 지분 증명 (Delegated Proof of Stake)",
      "소각 증명 (Proof of Burn)"
    ],
    answer: "지분 증명 (Proof of Stake)"
  },
  {
    question: "여러 블록체인을 연결해서 소통하게 하는 플랫폼은?",
    options: [
      "폴카닷 (Polkadot)",
      "카르다노 (Cardano)",
      "체인링크 (Chainlink)",
      "솔라나 (Solana)"
    ],
    answer: "폴카닷 (Polkadot)"
  },
  {
    question: "DeFi는 무엇의 약자인가요?",
    options: [
      "탈중앙화 금융",
      "디지털 금융",
      "분산 금융",
      "다이나믹 금융"
    ],
    answer: "탈중앙화 금융"
  },
  {
    question: "종종 '디지털 은'이라고 불리는 코인은?",
    options: [
      "라이트코인 (Litecoin)",
      "이더리움 (Ethereum)",
      "비트코인 캐시 (Bitcoin Cash)",
      "리플 (Ripple)"
    ],
    answer: "라이트코인 (Litecoin)"
  },
  {
    question: "개인정보 보호로 유명한 코인은?",
    options: [
      "모네로 (Monero)",
      "비트코인 (Bitcoin)",
      "이더리움 (Ethereum)",
      "도지코인 (Dogecoin)"
    ],
    answer: "모네로 (Monero)"
  },
  {
    question: "새로운 코인을 만드는 분기(나뉨)를 뭐라고 하나요?",
    options: [
      "하드포크 (Hard Fork)",
      "소프트포크 (Soft Fork)",
      "병합 (Merge)",
      "분할 (Split)"
    ],
    answer: "하드포크 (Hard Fork)"
  },
  {
    question: "미국 달러로 가치를 고정한 코인은?",
    options: [
      "테더 (USDT)",
      "비트코인 (Bitcoin)",
      "이더리움 (Ethereum)",
      "도지코인 (Dogecoin)"
    ],
    answer: "테더 (USDT)"
  },
  {
    question: "바이낸스 스마트 체인의 대표 토큰은?",
    options: [
      "BNB",
      "BTC",
      "ETH",
      "ADA"
    ],
    answer: "BNB"
  },
  {
    question: "ERC-20 토큰을 만든 플랫폼은?",
    options: [
      "이더리움 (Ethereum)",
      "비트코인 (Bitcoin)",
      "리플 (Ripple)",
      "라이트코인 (Litecoin)"
    ],
    answer: "이더리움 (Ethereum)"
  },
  // ✨ 추가로 더 쉬운 문제들
  {
    question: "비트코인을 만든 가상의 인물 이름은?",
    options: [
      "사토시 나카모토",
      "일론 머스크",
      "빌 게이츠",
      "마크 저커버그"
    ],
    answer: "사토시 나카모토"
  },
  {
    question: "도지코인(Dogecoin)의 심볼(마스코트)은 어떤 동물인가요?",
    options: [
      "강아지",
      "고양이",
      "토끼",
      "여우"
    ],
    answer: "강아지"
  },
  {
    question: "비트코인은 무엇을 위한 화폐인가요?",
    options: [
      "디지털 화폐",
      "종이 화폐",
      "금으로 만든 동전",
      "게임 아이템"
    ],
    answer: "디지털 화폐"
  },
  {
    question: "블록체인은 데이터를 어떻게 저장하나요?",
    options: [
      "여러 컴퓨터에 나눠서 저장",
      "한 서버에만 저장",
      "USB에 저장",
      "메모장에 저장"
    ],
    answer: "여러 컴퓨터에 나눠서 저장"
  }
];


function shuffleArray(array) {
  let newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function CoinQuiz() {
  // 컴포넌트가 마운트될 때 quizData 배열을 셔플하여 quizQuestions 상태에 저장합니다.
  const [quizQuestions, setQuizQuestions] = useState(shuffleArray(quizData));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showNext, setShowNext] = useState(false);

  // 사용자가 답변을 선택하면 즉시 피드백을 주고, 점수를 업데이트합니다.
  const handleAnswerOptionClick = (selectedOption) => {
    if (feedback !== "") return; // 이미 답변한 경우 무시

    if (selectedOption === quizQuestions[currentQuestion].answer) {
      setFeedback("정답입니다!");
      setScore(score + 1);
    } else {
      setFeedback("오답입니다!");
    }
    setShowNext(true);
  };

  // 다음 문제로 넘어가는 함수
  const handleNextQuestion = () => {
    setFeedback("");
    setShowNext(false);
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quizQuestions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      // 모든 문제를 풀었을 경우 최종 점수를 알림 후 게임을 리셋
      alert(`퀴즈 종료! 점수: ${score} / ${quizQuestions.length}`);
      setQuizQuestions(shuffleArray(quizData));
      setCurrentQuestion(0);
      setScore(0);
    }
  };

  return (
    <div className="coin-quiz-container">
      <div className="question-section">
        <div className="question-count">
          문제
        </div>
        <div className="question-text">
          {quizQuestions[currentQuestion].question}
        </div>
      </div>
      <div className="answer-section">
        {quizQuestions[currentQuestion].options.map((option) => (
          <button key={option} onClick={() => handleAnswerOptionClick(option)}>
            {option}
          </button>
        ))}
      </div>
      {feedback && <div className="feedback">{feedback}</div>}
      {showNext && (
        <button className="next-button" onClick={handleNextQuestion}>
          다음 문제
        </button>
      )}
    </div>
  );
}

export default CoinQuiz;