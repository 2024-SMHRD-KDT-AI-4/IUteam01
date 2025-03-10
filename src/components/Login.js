import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css' // 스타일 적용

const Login = () => {
    const [inputId, setId] = useState('');
    const [inputPw, setPw] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태 추가
    const nav = useNavigate();

    function tryLogin() {
        // 1️⃣ 유효성 검사: 아이디와 비밀번호가 비어 있으면 요청 보내지 않기
        if (!inputId.trim() || !inputPw.trim()) {
            setErrorMessage("아이디와 비밀번호를 입력해주세요.");
            return;
        }

        // 2️⃣ 서버로 로그인 요청
        axios.post("http://localhost:3307/login", { 
            id: inputId,
            pw: inputPw
        }).then((res) => {
            console.log(res.data);
            
            if (res.data.result === "로그인 성공") {  
                window.localStorage.setItem('nick', res.data.nick);
                nav("/");
            } else {
                setErrorMessage("로그인 실패! 아이디 또는 비밀번호를 확인하세요.");
                nav("/login");
            }
        }).catch((error) => {
            console.error("오류 발생:", error);
            setErrorMessage("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        });
    }

    return (
        <div className="login-container">
            <h2>로그인</h2>
            <input type="text" placeholder="아이디를 입력하세요"
                onChange={(e) => setId(e.target.value)} />

            <input type="password" placeholder="비밀번호를 입력하세요"
                onChange={(e) => setPw(e.target.value)} />

            {/* 3️⃣ 에러 메시지를 사용자에게 표시 */}
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button onClick={tryLogin}>로그인 시도</button>
        </div>
    );
}

export default Login;
