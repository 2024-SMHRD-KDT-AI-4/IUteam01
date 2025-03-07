import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css' // 스타일 적용

const Login = () => {
    const [inputId, setId] = useState('')
    const [inputPw, setPw] = useState('')
    const nav = useNavigate()

    function tryLogin() {
        axios.post("http://localhost:3307/login", { // POST 방식으로 수정
            id: inputId,
            pw: inputPw
        }).then((res) => {
            console.log(res.data);
            
            if (res.data.result === "로그인 성공") {  // res.data를 비교해야 함

              window.localStorage.setItem('nick',res.data.nick)
                nav("/")
                
            } else {
                nav("/login")
            }
        }).catch((error) => {
            console.error("오류 발생:", error);
        });
    }

    return (
        <div className="login-container">
            <h2>로그인</h2>
            <input type="text" placeholder="아이디를 입력하세요"
                onChange={(e) => setId(e.target.value)} />

            <input type="password" placeholder="비밀번호를 입력하세요"
                onChange={(e) => setPw(e.target.value)} />

            <button onClick={tryLogin}>로그인 시도</button>
        </div>
    )
}

export default Login;
