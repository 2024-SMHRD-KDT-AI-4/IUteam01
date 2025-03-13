import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import "./Signup.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [inputId, setId] = useState("");
  const [inputPw, setPw] = useState("");
  const [inputName, setName] = useState("");
  const [inputGender, setGd] = useState("");
  const [inputBirthday, setBd] = useState("");
  const [inputNick, setNick] = useState("");
  const [inputRole, setRole] = useState("회원");
  const [input_AT, setAt] = useState("");
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [idVerificationResult, setIdVerificationResult] = useState("");
  const [idFile, setIdFile] = useState(null);
  const fileInputRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    setAt(getCurrentDate());
  }, []);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // 아이디 중복 확인 함수
  const checkIdDuplicate = () => {
    if (!inputId.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }
    axios
      .post("http://localhost:3307/check-id", { id: inputId })
      .then((res) => {
        alert(res.data.message);
        setIsIdChecked(true);
      })
      .catch((error) => {
        console.error("아이디 중복 체크 오류:", error);
        if (error.response && error.response.status === 409) {
          alert(error.response.data.error);
        } else {
          alert("아이디 중복 체크 중 오류가 발생했습니다.");
        }
        setIsIdChecked(false);
      });
  };

  // 신분증 파일 선택창 열기 (버튼 클릭 시)
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택 시 즉시 OCR 인증 요청 수행
  const handleFileChange = async (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setIdFile(file);
      setIdVerificationResult("OCR 처리 중...");

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post("http://localhost:3307/verify-id", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.adult) {
          setIdVerificationResult(`인증 성공: 성인입니다.`);
        } else {
          setIdVerificationResult(`인증 실패: 미성년자입니다.`);
        }
      } catch (error) {
        console.error("신분증 인증 오류:", error);
        setIdVerificationResult("신분증 인증 중 오류 발생");
      }
    }
  };

  // 회원가입 요청 함수
  const trySignup = () => {
    if (!isIdChecked) {
      alert("아이디 중복 확인을 해주세요.");
      return;
    }
    // 신분증 인증이 완료되지 않은 경우 회원가입 차단
    if (!idVerificationResult.includes("인증 성공")) {
      alert("신분증 인증을 완료해야 회원가입이 가능합니다.");
      return;
    }
    axios
      .post("http://localhost:3307/signup", {
        id: inputId,
        pw: inputPw,
        name: inputName,
        gd: inputGender,
        bd: inputBirthday,
        nick: inputNick,
        role: inputRole,
        at: input_AT,
      })
      .then((res) => {
        if (res.data.message === "회원가입 성공") {
          alert("회원가입이 완료되었습니다!");
          nav("/");
        } else {
          alert("회원가입 실패: " + JSON.stringify(res.data));
        }
      })
      .catch((error) => {
        console.error("회원가입 오류:", error);
        alert("회원가입에 실패하였습니다.");
      });
  };

  return (
    <div className="signup-container">
      <h2>회원가입</h2>
      <form>
        {/* 신분증 인증 부분 – 파일 첨부와 동시에 인증 요청 */}
        <div className="id-verification">
          <button type="button" onClick={openFileDialog}>
            신분증 인증하기
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          {idVerificationResult && <p>{idVerificationResult}</p>}
        </div>

        <label>아이디</label>
        <input
          type="text"
          placeholder="아이디를 입력하세요"
          value={inputId}
          onChange={(e) => {
            setId(e.target.value);
            setIsIdChecked(false);
          }}
        />
        <button type="button" onClick={checkIdDuplicate}>
          아이디 중복 확인
        </button>

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
        <input type="text" value="회원" readOnly />

        <label>가입 날짜</label>
        <input type="date" value={input_AT} readOnly />

        <button type="button" onClick={trySignup}>
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Signup;
