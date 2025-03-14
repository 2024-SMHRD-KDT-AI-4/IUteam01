import React, { useState } from "react";
import AnimatedReel from "./AnimatedReel";
import "./SlotMachine.css";

function SlotMachine() {
  const symbols = ["🍒", "🍋", "⭐", "🍇", "🔔", "💎"];
  // 각 슬롯의 최종 인덱스 초기값 설정
  const [finalIndices, setFinalIndices] = useState([0, 0, 0]);
  // spinTrigger로 애니메이션 재시작
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [result, setResult] = useState("");
  // 점수 상태: 초기 점수 0
  const [score, setScore] = useState(0);

  const spin = () => {
    // 각 릴에 대해 랜덤 최종 인덱스 생성
    const newFinalIndices = finalIndices.map(() => Math.floor(Math.random() * symbols.length));
    setFinalIndices(newFinalIndices);
    // spinTrigger 업데이트로 애니메이션 재시작
    setSpinTrigger(prev => prev + 1);

    // 스핀 당 비용 차감 (예: 1점 차감)
    setScore(prev => prev - 1);

    // 슬롯머신 애니메이션 시간 후 결과 확인 (예: 3초 후)
    setTimeout(() => {
      if (newFinalIndices.every((index) => index === newFinalIndices[0])) {
        setResult("🎉 잭팟! 축하합니다!");
        // 잭팟 당첨 시 보너스 점수 추가 (예: +10점)
        setScore(prev => prev + 10);
      } else {
        setResult("😅 아쉽지만 다음 기회에...");
      }
    }, 3000);
  };

  const reset = () => {
    setFinalIndices([0, 0, 0]);
    setResult("");
    // 점수 리셋: 필요에 따라 리셋하지 않고 누적 점수를 유지할 수도 있음.
    setScore(0);
  };

  return (
    <div className="slot-machine-container">
      <h2>🎰 슬롯머신 게임</h2>
      <div className="slot-reels">
        {finalIndices.map((finalIndex, idx) => (
          <AnimatedReel
            key={idx}
            symbols={symbols}
            finalIndex={finalIndex}
            spinTrigger={spinTrigger}
          />
        ))}
      </div>
      {result && <h3 className="result-msg">결과: {result}</h3>}
      <div className="score-board">
        <p>현재 점수: {score}</p>
      </div>
      <div className="button-group">
        <button onClick={spin}>Spin!</button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

export default SlotMachine;
