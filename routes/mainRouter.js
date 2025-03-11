
const express = require("express");
const router = express.Router();
const path = require("path");
const publicPath = path.join(__dirname, "../public/");
const conn = require("../config/db");
const multer = require("multer");

// 로그인 API
router.post("/login", (req, res) => {
  let { id, pw } = req.body;
  if (!id || !pw) {
    return res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요." });
  }

  let sql = "SELECT * FROM USER_INFO WHERE USER_ID = ? AND USER_PW = ?";
  conn.query(sql, [id, pw], (err, result) => {
    if (err) {
      console.error("로그인 오류:", err);
      return res.status(500).json({ error: "서버 오류 발생" });
    }

    if (result.length > 0) {
      return res.json({
        result: "로그인 성공",
        nick: result[0].USER_NICK,
      });
    } else {
      return res
        .status(401)
        .json({ error: "로그인 실패: 아이디 또는 비밀번호가 일치하지 않습니다." });
    }
  });
});

// 회원가입 API
// 아이디 중복 체크 API 추가
router.post("/check-id", (req, res) => {
  let { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "아이디를 입력해주세요." });
  }

  let checkIdSql = "SELECT * FROM USER_INFO WHERE USER_ID = ?";
  conn.query(checkIdSql, [id], (err, result) => {
    if (err) {
      console.error("중복 체크 오류:", err);
      return res.status(500).json({ error: "서버 오류 발생" });
    }
    if (result.length > 0) {
      return res.status(409).json({ error: "이미 사용 중인 아이디입니다." });
    } else {
      return res.json({ message: "사용 가능한 아이디입니다." });
    }
  });
});


router.post("/signup", (req, res) => {
  let { id, pw, name, gd, bd, nick, role, at } = req.body;
  if (!id || !pw || !name || !gd || !bd || !nick || !role || !at) {
    return res.status(400).json({ error: "모든 필드를 입력해주세요." });
  }

  let checkIdSql = "SELECT * FROM USER_INFO WHERE USER_ID = ?";
  conn.query(checkIdSql, [id], (err, result) => {
    if (err) {
      console.error("중복 체크 오류:", err);
      return res.status(500).json({ error: "서버 오류 발생" });
      
    }
    if (result.length > 0) {
      return res.status(409).json({ error: "이미 사용 중인 아이디입니다." });
    }

    let sql =
      "INSERT INTO USER_INFO(USER_ID, USER_PW, USER_NAME, USER_GENDER, USER_BIRTHDATE, USER_NICK, USER_ROLE, JOIND_AT) VALUES(?,?,?,?,?,?,?,?)";
    conn.query(sql, [id, pw, name, gd, bd, nick, role, at], (err, result) => {
      if (err) {
        console.error("회원가입 오류:", err);
        return res
          .status(500)
          .json({ error: "회원가입 중 오류가 발생했습니다." });
      }
      if (result.affectedRows > 0) {
        return res.json({ message: "회원가입 성공" });
      } else {
        return res.status(500).json({ error: "회원가입 실패" });
      }
    });
  });
});

// ============================================
// multer 설정 (파일 업로드 경로와 파일명 설정)
// ============================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // public 폴더 안의 uploads 폴더에 저장
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// ============================================
// 문의(질문) 등록 API (QUESTION_INFO 테이블 사용)
// ============================================
router.post("/inquiry", upload.single("file"), (req, res) => {
  const { title, content, userId } = req.body;
  
  // 업로드된 파일이 있다면 웹에서 접근 가능한 경로와 원본 파일명 저장
  let filePath = req.file ? "/uploads/" + req.file.filename : null;
  let originalFileName = req.file ? req.file.originalname : null;

  // QUESTION_INFO 테이블 컬럼: QUES_IDX (AUTO_INCREMENT), QUES_TITLE, QUES_CONTENT, QUES_FILE, QUES_ORG_FILE, CREATED_AT, QUES_VIEWS, USER_ID
  const sql = `
    INSERT INTO QUESTION_INFO
      (QUES_TITLE, QUES_CONTENT, QUES_FILE, QUES_ORG_FILE, CREATED_AT, QUES_VIEWS, USER_ID)
    VALUES
      (?, ?, ?, ?, NOW(), 0, ?)
  `;
  conn.query(sql, [title, content, filePath, originalFileName, userId], (err, result) => {
    if (err) {
      console.error("문의 등록 오류:", err);
      return res.json({ success: false });
    }

    const insertedId = result.insertId;
    const selectSql = "SELECT * FROM QUESTION_INFO WHERE QUES_IDX = ?";
    conn.query(selectSql, [insertedId], (err2, rows) => {
      if (err2) {
        console.error("등록된 문의 조회 오류:", err2);
        return res.json({ success: false });
      }
      return res.json({ success: true, newInquiry: rows[0] });
    });
  });
});

// ============================================
// 문의(질문) 목록 조회 API
// ============================================
router.get("/inquiries", (req, res) => {
  const sql = "SELECT * FROM QUESTION_INFO ORDER BY CREATED_AT DESC";
  conn.query(sql, (err, rows) => {
    if (err) {
      console.error("문의 목록 불러오기 오류:", err);
      return res.status(500).json({ error: "문의 목록 불러오기 실패" });
    }
    res.json(rows);
  });
});

// ============================================
// 문의(질문) 상세 조회 API
// ============================================
router.get("/inquiry/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM QUESTION_INFO WHERE QUES_IDX = ?";
  conn.query(sql, [id], (err, rows) => {
    if (err) {
      console.error("문의 상세 조회 오류:", err);
      return res.status(500).json({ error: "문의 상세 조회 실패" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "해당 문의가 존재하지 않습니다." });
    }
    res.json(rows[0]);
  });
});

module.exports = router;

