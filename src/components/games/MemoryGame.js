import React, { useState, useEffect } from "react";
import "./MemoryGame.css";

// 난이도에 따른 카드 개수 (4x4: 16장, 6x6: 36장)
const difficulties = {
  "4x4": 16,
  "6x6": 36,
};

function MemoryGame() {
  // 난이도 선택 상태: 기본은 4x4
  const [difficulty, setDifficulty] = useState("4x4");
  const totalCards = difficulties[difficulty];
  const numPairs = totalCards / 2;

  // 이모지 테마: 카드에 사용할 심볼들
  const emojiThemes = [
    "🍎", "🍌", "🍒", "🍇", "🍉", "🍓", "🍍", "🥝", "🍑", "🍋", "🍊", "🍈",
  ];

  // 카드 덱 상태: 초기에는 빈 배열, 이후 난이도에 맞춰 셔플된 배열 생성
  const [cards, setCards] = useState([]);
  // 현재 뒤집힌 카드의 인덱스 (최대 2장)
  const [flippedCards, setFlippedCards] = useState([]);
  // 이미 매칭된 카드의 인덱스
  const [matchedCards, setMatchedCards] = useState([]);
  // 사용자의 이동 횟수
  const [moves, setMoves] = useState(0);
  // 30초 타이머
  const [timeLeft, setTimeLeft] = useState(30);
  // 게임 종료 여부
  const [gameOver, setGameOver] = useState(false);

  // 배열 셔플 함수
  function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  // 게임 초기화 함수: 난이도 선택이나 리셋 시 실행
  const resetGame = () => {
    // 난이도에 맞는 쌍의 수만큼 이모지를 선택 (필요하면 반복)
    let selectedEmojis = [];
    for (let i = 0; i < numPairs; i++) {
      selectedEmojis.push(emojiThemes[i % emojiThemes.length]);
    }
    // 카드 덱은 쌍으로 만들어 두 번 복제한 후 셔플
    const newDeck = shuffle([...selectedEmojis, ...selectedEmojis]);
    setCards(newDeck);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setTimeLeft(30);
    setGameOver(false);
  };

  // 난이도 변경 시 게임 초기화
  useEffect(() => {
    resetGame();
  }, [difficulty]);

  // 타이머 효과
  useEffect(() => {
    if (gameOver) return;
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameOver]);

  // 카드 클릭 처리
  const handleCardClick = (index) => {
    // 이미 뒤집힌 카드이거나 매칭된 카드면 무시
    if (flippedCards.includes(index) || matchedCards.includes(index)) return;
    if (flippedCards.length === 2) return;

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      // 두 카드 비교
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        // 매칭 성공: matchedCards에 추가
        setMatchedCards((prev) => [...prev, ...newFlipped]);
        setFlippedCards([]);
      } else {
        // 매칭 실패: 1초 후 카드 뒤집기
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // 게임 승리 체크: 모든 카드가 매칭되면 게임 종료
  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setGameOver(true);
    }
  }, [matchedCards, cards]);

  return (
    <div className="memory-game-container">
      <h2>메모리 카드 매칭</h2>
      <div className="controls">
        <label>
          난이도 선택: 
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {Object.keys(difficulties).map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </label>
        <button onClick={resetGame}>새 게임 시작</button>
      </div>
      <div className="stats">
        <p>이동 횟수: {moves}</p>
        <p>남은 시간: {timeLeft}초</p>
      </div>
      {gameOver && (
        <div className="game-result">
          {timeLeft === 0 && matchedCards.length !== cards.length ? (
            <p>시간 종료! 게임 오버!</p>
          ) : (
            <p>축하합니다! 모든 카드를 맞추셨습니다!</p>
          )}
        </div>
      )}
      <div
        className="card-grid"
        style={{
          gridTemplateColumns: `repeat(${Math.sqrt(cards.length)}, 1fr)`
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            className={`card ${flippedCards.includes(index) || matchedCards.includes(index) ? "flipped" : ""}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">❓</div>
              <div className="card-back">{card}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemoryGame;
