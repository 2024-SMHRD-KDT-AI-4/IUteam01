import React, { useState, useEffect } from "react";
import "./ClickGame.css";

function ClickGame() {
  const gridSize = 9; // 3x3 격자
  const initialInterval = 1000; // 초기 두더지 등장 시간 (1000ms)
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [molePosition, setMolePosition] = useState(null);
  const [intervalTime, setIntervalTime] = useState(initialInterval);

  // 점수에 따라 레벨 업 및 등장 속도 조정 (예: 매 5점마다 레벨 증가)
  useEffect(() => {
    const newLevel = Math.floor(score / 5) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      // 레벨이 올라갈수록 두더지 등장 시간을 단축 (최소 300ms)
      const newInterval = Math.max(initialInterval - (newLevel - 1) * 100, 300);
      setIntervalTime(newInterval);
    }
  }, [score, level]);

  // 두더지의 위치를 주기적으로 업데이트하는 타이머 설정
  useEffect(() => {
    const timer = setInterval(() => {
      const randomPos = Math.floor(Math.random() * gridSize);
      setMolePosition(randomPos);
    }, intervalTime);

    return () => clearInterval(timer);
  }, [intervalTime]);

  // 사용자가 격자 칸 클릭 시 처리
  const handleClick = (index) => {
    if (index === molePosition) {
      setScore((prev) => prev + 1);
      setMolePosition(null); // 두더지를 즉시 제거
    }
  };

  // 게임 리셋 함수
  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setIntervalTime(initialInterval);
    setMolePosition(null);
  };

  return (
    <div className="click-game-container">
      <h2>Whac-A-Mole 게임</h2>
      <div className="stats">
        <p>Score: {score}</p>
        <p>Level: {level}</p>
      </div>
      <div className="grid-container">
        {[...Array(gridSize)].map((_, index) => (
          <div
            key={index}
            className="grid-cell"
            onClick={() => handleClick(index)}
          >
            {index === molePosition && <span className="mole">🐹</span>}
          </div>
        ))}
      </div>
      <button onClick={resetGame}>Reset Game</button>
    </div>
  );
}

export default ClickGame;
