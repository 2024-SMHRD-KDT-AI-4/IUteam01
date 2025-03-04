// src/components/NoticeScreen.js
import React from "react";

function NoticeScreen({ handleContinue }) {
  return (
    <div style={{ margin: "2rem", border: "1px solid #ccc", padding: "1rem" }}>
      <h1>📢 이용 안내 (필수 확인)</h1>
      <p>
        📌본 서비스는 투자 참고용으로, 투자 조언이나 보장을 제공하지 않습니다.
        <br />
        📌모든 투자 책임은 사용자에게 있습니다.
        <br />
        📌코인 가격은 변동성이 매우 큽니다.
        <br />
        📌데이터 지연 혹은 부정확 가능성이 있습니다.
        <br />
        📌본 서비스는 법적 책임을 지지 않습니다.
        <br />
        <span>
          📌 위 내용을 확인하였으며, 본인의 판단하에 서비스를 이용하겠습니다.
        </span>
      </p>
      <button onClick={handleContinue} style={{ marginTop: "1rem" }}>
        [동의하고 계속하기]
      </button>
    </div>
  );
}

export default NoticeScreen;
