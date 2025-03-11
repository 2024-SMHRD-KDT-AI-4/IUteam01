import axios from "axios";
import React, { useState, useEffect } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [inputId, setId] = useState("");
  const [inputPw, setPw] = useState("");
  const [inputName, setName] = useState("");
  const [inputGender, setGd] = useState("");
  const [inputBirthday, setBd] = useState("");
  const [inputNick, setNick] = useState("");
  const [inputRole, setRole] = useState("회원"); // 기본값을 '회원'으로 설정
  const [input_AT, setAt] = useState(""); // 가입 날짜
  
  const nav = useNavigate();

  // 📌 현재 날짜를 YYYY-MM-DD 형식으로 변환하는 함수
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // "YYYY-MM-DD" 형식으로 변환
  };

  // 📌 컴포넌트가 처음 렌더링될 때 가입 날짜를 자동 설정
  useEffect(() => {
    setAt(getCurrentDate());
  }, []);

  function trySignup() {
    axios
      .post("http://localhost:3307/signup", {
        id: inputId,
        pw: inputPw,
        name: inputName,
        gd: inputGender,
        bd: inputBirthday,
        nick: inputNick,
        role: inputRole,
        at: input_AT, // 가입 날짜 포함
      })
      .then((res) => {
        console.log("서버 응답:", res.data);

        if (res.data.message === "회원가입 성공") {
          alert("회원가입이 완료되었습니다!");
          setTimeout(() => {
            nav("/"); // 라우터 이동
          }, 500);
        } else {
          alert("회원가입 실패: " + JSON.stringify(res.data));
          console.log("회원가입 실패, 응답 데이터:", res.data);
        }
      })
      .catch((error) => {
        console.error("오류 발생:", error);
        alert("모든 정보를 입력해주세요.");
      });
  }

  return (
    <div className="signup-container">
      <h2>회원가입</h2>
      <form>
        <label>아이디</label>
        <input type="text" placeholder="아이디를 입력하세요" onChange={(e) => setId(e.target.value)} />

        <label>비밀번호</label>
        <input type="password" placeholder="비밀번호를 입력하세요" onChange={(e) => setPw(e.target.value)} />

        <label>이름</label>
        <input type="text" placeholder="이름을 입력하세요" onChange={(e) => setName(e.target.value)} />

        <label>성별</label>
        <select onChange={(e) => setGd(e.target.value)}>
          <option value="">성별 선택</option>
          <option value="남성">남성</option>
          <option value="여성">여성</option>
        </select>

        <label>생년월일</label>
        <input type="date" onChange={(e) => setBd(e.target.value)} />

        <label>닉네임</label>
        <input type="text" placeholder="닉네임을 입력하세요" onChange={(e) => setNick(e.target.value)} />

        <label>역할</label>
        <input type="text" value={"회원"} readOnly />

        <label>가입 날짜</label>
        <input type="date" value={input_AT} readOnly /> {/* 자동 설정된 날짜 표시 */}

        <button type="button" onClick={trySignup}>
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Signup;
