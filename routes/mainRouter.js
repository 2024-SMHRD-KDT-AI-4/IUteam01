const express = require("express");
const router = express.Router();
const path = require("path");
const publicPath = path.join(__dirname, "../public/");
const conn = require("../config/db");

// 로그인 API
router.post("/login", (req, res) => {
    let { id, pw } = req.body;

    // 1️⃣ 입력값 검증 (빈 값이면 오류 응답)
    if (!id || !pw) {
        return res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요." });
    }

    let sql = "SELECT * FROM USER_INFO WHERE USER_ID = ? AND USER_PW = ?";
    conn.query(sql, [id, pw], (err, result) => {
        if (err) {
            console.error("로그인 오류:", err);
            return res.status(500).json({ error: "서버 오류 발생" });
        }

        console.log("실행결과:", result);

        // 2️⃣ result가 비어 있는 경우 예외 처리
        if (result.length > 0) {
            return res.json({
                result: "로그인 성공",
                nick: result[0].USER_NICK
            });
        } else {
            return res.status(401).json({ error: "로그인 실패: 아이디 또는 비밀번호가 일치하지 않습니다." });
        }
    });
});

// 회원가입 API
router.post("/signup", (req, res) => {
    let { id, pw, name, gd, bd, nick, role, at } = req.body;

    // 3️⃣ 입력값 검증 (필수 값 체크)
    if (!id || !pw || !name || !gd || !bd || !nick || !role || !at) {
        return res.status(400).json({ error: "모든 필드를 입력해주세요." });
    }

    // 아이디 중복 확인 쿼리
    let checkIdSql = "SELECT * FROM USER_INFO WHERE USER_ID = ?";
    conn.query(checkIdSql, [id], (err, result) => {
        if (err) {
            console.error("중복 체크 오류:", err);
            return res.status(500).json({ error: "서버 오류 발생" });
        }

        // 4️⃣ 아이디 중복 확인
        if (result.length > 0) {
            return res.status(409).json({ error: "이미 사용 중인 아이디입니다." });
        }

        // 회원가입 진행
        let sql = "INSERT INTO USER_INFO(USER_ID, USER_PW, USER_NAME, USER_GENDER, USER_BIRTHDATE, USER_NICK, USER_ROLE, JOIND_AT) VALUES(?,?,?,?,?,?,?,?)";
        conn.query(sql, [id, pw, name, gd, bd, nick, role, at], (err, result) => {
            if (err) {
                console.error("회원가입 오류:", err);
                return res.status(500).json({ error: "회원가입 중 오류가 발생했습니다." });
            }

            console.log("회원가입 결과:", result);
            if (result.affectedRows > 0) {
                return res.json({ message: "회원가입 성공" });
            } else {
                return res.status(500).json({ error: "회원가입 실패" });
            }
        });
    });
});

module.exports = router;
