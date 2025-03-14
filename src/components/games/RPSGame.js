import React, { useState } from "react";

/**
 * 간단한 가위바위보 게임 컴포넌트
 * - 사용자가 가위/바위/보 중 하나를 클릭
 * - 컴퓨터는 랜덤 선택
 * - 승/패/무승부 결과 + 승패 카운트 표시
 */
function RPSGame() {
  // 사용자 선택 (가위, 바위, 보)
  const [userChoice, setUserChoice] = useState(null);
  // 컴퓨터 선택 (가위, 바위, 보)
  const [computerChoice, setComputerChoice] = useState(null);
  // 결과 메시지 (승리, 패배, 무승부)
  const [result, setResult] = useState("");

  // 전적 카운트
  const [winCount, setWinCount] = useState(0);
  const [loseCount, setLoseCount] = useState(0);
  const [drawCount, setDrawCount] = useState(0);

  // 가위바위보 선택 목록
  const choices = ["가위", "바위", "보"];

  /**
   * 사용자가 버튼을 클릭해서 선택했을 때 실행되는 함수
   * @param {string} choice - "가위" | "바위" | "보"
   */
  const handleUserChoice = (choice) => {
    setUserChoice(choice);

    // 1) 컴퓨터 선택 (랜덤)
    const randomIndex = Math.floor(Math.random() * choices.length); // 0,1,2 중 랜덤
    const compChoice = choices[randomIndex];
    setComputerChoice(compChoice);

    // 2) 승패 계산
    const gameResult = computeResult(choice, compChoice);
    setResult(gameResult);

    // 3) 승패 카운트 업데이트
    if (gameResult === "승리") {
      setWinCount((prev) => prev + 1);
    } else if (gameResult === "패배") {
      setLoseCount((prev) => prev + 1);
    } else {
      // 무승부
      setDrawCount((prev) => prev + 1);
    }
  };

  /**
   * 가위바위보 승패 로직
   * @param {string} user - 사용자 선택
   * @param {string} comp - 컴퓨터 선택
   * @returns {"승리" | "패배" | "무승부"}
   */
  const computeResult = (user, comp) => {
    if (user === comp) {
      return "무승부";
    }
    if (
      (user === "가위" && comp === "보") ||
      (user === "바위" && comp === "가위") ||
      (user === "보" && comp === "바위")
    ) {
      return "승리";
    }
    return "패배";
  };

  /**
   * 전체 기록 및 결과 초기화
   */
  const resetGame = () => {
    setUserChoice(null);
    setComputerChoice(null);
    setResult("");
    setWinCount(0);
    setLoseCount(0);
    setDrawCount(0);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>🖐 가위바위보 게임</h2>

      {/* 가위바위보 선택 버튼 */}
      <div style={{ marginBottom: "10px" }}>
        {choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => handleUserChoice(choice)}
            style={{ margin: "0 5px", fontSize: "16px" }}
          >
            {choice}
          </button>
        ))}
      </div>

      {/* 현재 선택 상태 표시 */}
      <div style={{ marginBottom: "10px" }}>
        <p>사용자 선택: {userChoice || "없음"}</p>
        <p>컴퓨터 선택: {computerChoice || "없음"}</p>
      </div>

      {/* 결과 메시지 */}
      {result && (
        <p style={{ fontWeight: "bold", fontSize: "18px" }}>
          결과: {result === "승리" ? "🎉 승리!" : result === "패배" ? "😫 패배" : "😐 무승부"}
        </p>
      )}

      {/* 전적 표시 */}
      <div style={{ margin: "10px 0" }}>
        <p>승리: {winCount}번</p>
        <p>패배: {loseCount}번</p>
        <p>무승부: {drawCount}번</p>
      </div>

      {/* 리셋 버튼 */}
      <button onClick={resetGame} style={{ fontSize: "16px", marginTop: "10px" }}>
        초기화
      </button>
    </div>
  );
}

export default RPSGame;
