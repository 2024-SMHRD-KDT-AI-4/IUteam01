import axios from 'axios'
import React, { useState } from 'react'
import './Signup.css' // 스타일 파일 import
import { useNavigate } from 'react-router-dom'

const Signup = () => {
  const [inputId, setId] = useState('')
  const [inputPw, setPw] = useState('')
  const [inputName, setName] = useState('')
  const [inputGender, setGd] = useState('')
  const [inputBirthday, setBd] = useState('')
  const [inputNick, setNick] = useState('')
  const [inputRole, setRole] = useState('회원') // 기본값을 '회원'으로 설정
  const [input_AT, setAt] = useState('')
  const nav = useNavigate()

  function trySignup() {
    axios.post("http://localhost:3307/signup", {
      id: inputId,
      pw: inputPw,
      name: inputName,
      gd: inputGender,
      bd: inputBirthday,
      nick: inputNick,
      role: inputRole, // '회원'으로 고정됨
      at: input_AT
    }).then((res) => {
      console.log(res);
      if (res.data === "회원가입 성공") {
        nav("/")
      } else {
        console.log("회원가입 실패");
        nav("/signup")
      }
    }).catch((error) => {
      console.error("오류 발생:", error);
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
        <input type="text" value={inputRole} readOnly /> {/* 역할을 '회원'으로 고정 */}

        <label>가입 날짜</label>
        <input type="date" onChange={(e) => setAt(e.target.value)} />

        <button type="button" onClick={trySignup}>회원가입</button>
      </form>
    </div>
  )
}

export default Signup
