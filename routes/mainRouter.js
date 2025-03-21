const express = require("express");
const router = express.Router();
const path = require("path");
const conn = require("../config/db");
const multer = require("multer");
const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");

// ==============================
// multer 설정 - diskStorage (파일 저장)
// ==============================
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // public 폴더 안의 uploads 폴더에 저장
    cb(null, path.join(__dirname, "../public/uploads"));
  },
  filename: function (req, file, cb) {
    // 파일명이 Latin1으로 인코딩되어 있다면 UTF-8로 변환
    const convertedName = Buffer.from(file.originalname, "latin1").toString("utf8");
    cb(null, convertedName);
  },
});
const diskUpload = multer({ storage: diskStorage });

// ==============================
// multer 설정 - memoryStorage (파일은 메모리에 보관)
// ==============================
const memoryStorage = multer.memoryStorage();
const memoryUpload = multer({ storage: memoryStorage });

// ============================================
// 로그인 API
// ============================================
router.post("/login", (req, res) => {
  const { id, pw } = req.body;
  if (!id || !pw) {
    return res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요." });
  }
  const sql = "SELECT * FROM USER_INFO WHERE USER_ID = ? AND USER_PW = ?";
  conn.query(sql, [id, pw], (err, result) => {
    if (err) {
      console.error("로그인 오류:", err);
      return res.status(500).json({ error: "서버 오류 발생" });
    }
    if (result.length > 0) {
      const user = result[0];
      return res.json({
        result: "로그인 성공",
        nick: user.USER_NICK,
        role: user.USER_ROLE,
      });
    } else {
      return res.status(401).json({ error: "로그인 실패: 아이디 또는 비밀번호가 일치하지 않습니다." });
    }
  });
});

// ============================================
// 회원가입 API - 아이디 중복 체크
// ============================================
router.post("/check-id", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "아이디를 입력해주세요." });
  }
  const checkIdSql = "SELECT * FROM USER_INFO WHERE USER_ID = ?";
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

// ============================================
// 회원가입 API
// ============================================
router.post("/signup", (req, res) => {
  const { id, pw, name, gd, bd, nick, role, at } = req.body;
  if (!id || !pw || !name || !gd || !bd || !nick || !role || !at) {
    return res.status(400).json({ error: "모든 필드를 입력해주세요." });
  }
  const checkIdSql = "SELECT * FROM USER_INFO WHERE USER_ID = ?";
  conn.query(checkIdSql, [id], (err, result) => {
    if (err) {
      console.error("중복 체크 오류:", err);
      return res.status(500).json({ error: "서버 오류 발생" });
    }
    if (result.length > 0) {
      return res.status(409).json({ error: "이미 사용 중인 아이디입니다." });
    }
    const sql =
      "INSERT INTO USER_INFO(USER_ID, USER_PW, USER_NAME, USER_GENDER, USER_BIRTHDATE, USER_NICK, USER_ROLE, JOIND_AT) VALUES(?,?,?,?,?,?,?,?)";
    conn.query(sql, [id, pw, name, gd, bd, nick, role, at], (err, result) => {
      if (err) {
        console.error("회원가입 오류:", err);
        return res.status(500).json({ error: "회원가입 중 오류가 발생했습니다." });
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
// 신분증 인증 API (메모리 저장 방식)
// ============================================
router.post("/verify-id", memoryUpload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "파일이 업로드되지 않았습니다." });
  }
  
  // req.file.buffer에 파일 데이터가 있음 → 임시 파일로 기록 후 처리
  const tempFilePath = path.join(os.tmpdir(), req.file.originalname);
  fs.writeFile(tempFilePath, req.file.buffer, (err) => {
    if (err) {
      console.error("임시 파일 저장 오류:", err);
      return res.status(500).json({ error: "파일 처리 중 오류 발생" });
    }
    
    // 임시 파일 경로를 인자로 Python OCR 스크립트 실행
    execFile("C:\\Users\\smhrd\\anaconda3\\python.exe", ["ocr.py", tempFilePath], (error, stdout, stderr) => {
      if (stderr) {
        console.error("Python STDERR:", stderr);
      }
      if (error) {
        console.error("OCR 처리 오류:", error);
        return res.status(500).json({ error: "OCR 처리 중 오류 발생" });
      }
      console.log("Python STDOUT:", stdout);
      let result;
      try {
        result = JSON.parse(stdout);
      } catch (e) {
        console.error("JSON 파싱 오류:", e);
        return res.status(500).json({ error: "OCR 처리 결과 파싱 중 오류 발생" });
      }
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }
      return res.json(result);
    });
  });
});

// ============================================
// 문의(질문) 등록 API (QUESTION_INFO 테이블 사용)
// ============================================
router.post("/inquiry", diskUpload.single("file"), (req, res) => {
  const { title, content, userId } = req.body;
  const filePath = req.file ? "/uploads/" + req.file.filename : null;
  const originalFileName = req.file ? req.file.filename : null;
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
// 문의(질문) 목록 조회 API (작성자 닉네임 포함)
// ============================================
router.get("/inquiries", (req, res) => {
  const sql = `
    SELECT Q.*, U.USER_NICK
    FROM QUESTION_INFO Q
    JOIN USER_INFO U ON Q.USER_ID = U.USER_ID
    ORDER BY Q.CREATED_AT DESC
  `;
  conn.query(sql, (err, rows) => {
    if (err) {
      console.error("문의 목록 불러오기 오류:", err);
      return res.status(500).json({ error: "문의 목록 불러오기 실패" });
    }
    res.json(rows);
  });
});

// ============================================
// 문의(질문) 상세 조회 API (조회 시마다 조회수 1 증가)
// ============================================
router.get("/inquiry/:id", (req, res) => {
  const id = req.params.id;
  const updateSql = "UPDATE QUESTION_INFO SET QUES_VIEWS = QUES_VIEWS + 1 WHERE QUES_IDX = ?";
  conn.query(updateSql, [id], (err, updateResult) => {
    if (err) {
      console.error("조회수 증가 오류:", err);
      return res.status(500).json({ error: "조회수 증가 실패" });
    }
    const selectSql = `
      SELECT Q.*, U.USER_NICK
      FROM QUESTION_INFO Q
      JOIN USER_INFO U ON Q.USER_ID = U.USER_ID
      WHERE QUES_IDX = ?
    `;
    conn.query(selectSql, [id], (err, rows) => {
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
});

// ============================================
// 문의(질문) 삭제 API (작성자 본인 또는 관리자만 삭제 가능)
// ============================================
router.delete("/inquiry/:id", (req, res) => {
  const inquiryId = req.params.id;
  const { userId } = req.body;
  if (!userId) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }
  const sqlSelect = "SELECT USER_ID FROM QUESTION_INFO WHERE QUES_IDX = ?";
  conn.query(sqlSelect, [inquiryId], (err, rows) => {
    if (err) {
      console.error("문의 삭제 확인 오류:", err);
      return res.status(500).json({ error: "서버 오류 발생" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "해당 문의가 존재하지 않습니다." });
    }
    const inquiryOwner = rows[0].USER_ID;
    if (userId === inquiryOwner) {
      deleteInquiry();
    } else {
      const sqlRole = "SELECT USER_ROLE FROM USER_INFO WHERE USER_ID = ?";
      conn.query(sqlRole, [userId], (err2, roleRows) => {
        if (err2) {
          console.error("관리자 확인 오류:", err2);
          return res.status(500).json({ error: "서버 오류 발생" });
        }
        if (roleRows.length === 0) {
          return res.status(403).json({ error: "접근 권한이 없습니다." });
        }
        const userRole = roleRows[0].USER_ROLE;
        if (userRole === "관리자") {
          deleteInquiry();
        } else {
          return res.status(403).json({ error: "삭제 권한이 없습니다." });
        }
      });
    }
    function deleteInquiry() {
      const sqlDelete = "DELETE FROM QUESTION_INFO WHERE QUES_IDX = ?";
      conn.query(sqlDelete, [inquiryId], (err3, result) => {
        if (err3) {
          console.error("문의 삭제 오류:", err3);
          return res.status(500).json({ error: "문의 삭제 실패" });
        }
        if (result.affectedRows > 0) {
          return res.json({ success: true });
        } else {
          return res.status(500).json({ error: "문의 삭제 실패" });
        }
      });
    }
  });
});

// ============================================
// 댓글 등록 API
// ============================================
router.post("/comment", (req, res) => {
  const { ques_idx, comment, userId, userNick } = req.body;
  if (!ques_idx || !comment || !userId || !userNick) {
    return res.status(400).json({ error: "필수 필드를 모두 입력해주세요." });
  }
  const sql = `
    INSERT INTO COMMENT_INFO (QUES_IDX, COMMENT_CONTENT, USER_ID, USER_NICK, CREATED_AT)
    VALUES (?, ?, ?, ?, NOW())
  `;
  conn.query(sql, [ques_idx, comment, userId, userNick], (err, result) => {
    if (err) {
      console.error("댓글 등록 오류:", err);
      return res.status(500).json({ success: false });
    }
    const insertedId = result.insertId;
    const selectSql = "SELECT * FROM COMMENT_INFO WHERE COMMENT_IDX = ?";
    conn.query(selectSql, [insertedId], (err2, rows) => {
      if (err2) {
        console.error("등록된 댓글 조회 오류:", err2);
        return res.status(500).json({ success: false });
      }
      return res.json({ success: true, newComment: rows[0] });
    });
  });
});

// ============================================
// 댓글 목록 조회 API
// ============================================
router.get("/comments", (req, res) => {
  const { ques_idx } = req.query;
  if (!ques_idx) {
    return res.status(400).json({ error: "문의 번호가 필요합니다." });
  }
  const sql = "SELECT * FROM COMMENT_INFO WHERE QUES_IDX = ? ORDER BY CREATED_AT ASC";
  conn.query(sql, [ques_idx], (err, rows) => {
    if (err) {
      console.error("댓글 목록 불러오기 오류:", err);
      return res.status(500).json({ error: "댓글 목록 불러오기 실패" });
    }
    res.json(rows);
  });
});

// ============================================
// 댓글 삭제 API (댓글 작성자와 관리자만 삭제 가능)
// ============================================
router.delete("/comment/:commentId", (req, res) => {
  const commentId = req.params.commentId;
  const { userId } = req.body;
  if (!userId) {
    return res.status(401).json({ error: "로그인이 필요합니다." });
  }
  const selectSql = "SELECT USER_ID FROM COMMENT_INFO WHERE COMMENT_IDX = ?";
  conn.query(selectSql, [commentId], (err, rows) => {
    if (err) {
      console.error("댓글 삭제 확인 오류:", err);
      return res.status(500).json({ error: "서버 오류 발생" });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: "해당 댓글이 존재하지 않습니다." });
    }
    const commentOwner = rows[0].USER_ID;
    if (userId === commentOwner) {
      deleteComment();
    } else {
      const sqlRole = "SELECT USER_ROLE FROM USER_INFO WHERE USER_ID = ?";
      conn.query(sqlRole, [userId], (err2, roleRows) => {
        if (err2) {
          console.error("관리자 확인 오류:", err2);
          return res.status(500).json({ error: "서버 오류 발생" });
        }
        if (roleRows.length === 0) {
          return res.status(403).json({ error: "접근 권한이 없습니다." });
        }
        const userRole = roleRows[0].USER_ROLE;
        if (userRole === "관리자") {
          deleteComment();
        } else {
          return res.status(403).json({ error: "삭제 권한이 없습니다." });
        }
      });
    }
    function deleteComment() {
      const deleteSql = "DELETE FROM COMMENT_INFO WHERE COMMENT_IDX = ?";
      conn.query(deleteSql, [commentId], (err3, result) => {
        if (err3) {
          console.error("댓글 삭제 오류:", err3);
          return res.status(500).json({ error: "댓글 삭제 실패" });
        }
        if (result.affectedRows > 0) {
          return res.json({ success: true });
        } else {
          return res.status(500).json({ error: "댓글 삭제 실패" });
        }
      });
    }
  });
});

module.exports = router;
