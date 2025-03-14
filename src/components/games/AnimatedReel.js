import React, { useEffect } from "react";
import { useSpring, animated } from "react-spring";
import "./AnimatedReel.css";

function AnimatedReel({ symbols, finalIndex, spinTrigger }) {
  const itemHeight = 60; // 각 심볼 아이템의 높이 (px)
  const totalSymbols = symbols.length;
  const loops = 5; // 몇 바퀴 돌릴지 (여기서는 5회)

  // 최종적으로 멈출 위치 (여러 바퀴를 돌고 최종 심볼까지)
  const finalOffset = (loops * totalSymbols + finalIndex) * itemHeight;

  // useSpring으로 애니메이션 효과 정의: from 0부터 최종 offset까지 translateY
  const [styles, api] = useSpring(() => ({
    from: { transform: `translateY(0px)` },
    to: { transform: `translateY(-${finalOffset}px)` },
    config: { tension: 20, friction: 10 },
    reset: true,
  }));

  // spinTrigger가 변경될 때마다 애니메이션 재실행
  useEffect(() => {
    api.start({ to: { transform: `translateY(-${finalOffset}px)` } });
  }, [spinTrigger, finalOffset, api]);

  return (
    <div className="reel-container" style={{ height: itemHeight, overflow: "hidden" }}>
      <animated.div style={styles}>
        {/* 심볼들을 여러 번 렌더링해서 무한 스크롤 효과 모방 */}
        {Array(loops + 1)
          .fill(0)
          .map((_, loopIdx) =>
            symbols.map((symbol, idx) => (
              <div key={`${loopIdx}-${idx}`} className="reel-item" style={{ height: itemHeight }}>
                {symbol}
              </div>
            ))
          )}
      </animated.div>
    </div>
  );
}

export default AnimatedReel;
