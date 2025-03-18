import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";

function InquirySection() {
  // isWriting이 true면 글 작성 폼, false면 글 목록을 보여줌
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 글 목록을 불러옴
  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = () => {
    axios
      .get("http://localhost:3307/inquiries")
      .then((res) => setInquiries(res.data))
      .catch((err) => console.error("글 목록 불러오기 오류:", err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력하세요.");
      return;
    }
  
    const loggedInUserId = window.localStorage.getItem("userId");
    if (!loggedInUserId) {
      alert("로그인이 필요합니다.");
      return;
    }
  
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (file) {
      console.log(file)
      formData.append("file", file);
    }
    formData.append("userId", loggedInUserId);
  
    try {
      const res = await axios.post("http://localhost:3307/inquiry", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("서버응답 :", res.data);
  
      if (res.data.success) {
         alert("글이 등록되었습니다.");
        // 🎯 첫 화면으로 이동하는 것이 아니라, 글 목록이 있는 inquiry 탭을 활성화
         window.location = "/"
         //navigate("/", { state: { activeTab: "inquiry" } });
        
      } else {
        alert("글 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("글 등록 오류:", error);
    }
  };

  return (
    <Box sx={{ padding: "1rem", maxWidth: 600, margin: "auto" }}>
      <Typography variant="h5" gutterBottom>
        {isWriting ? "글 작성" : "커뮤니티"}
      </Typography>
      {isWriting ? (
        // 글 작성 폼
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="제목"
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            label="내용"
            variant="outlined"
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained">
              등록하기
            </Button>
            <Button variant="outlined" onClick={() => setIsWriting(false)}>
              취소
            </Button>
          </Box>
        </Box>
      ) : (
        // 글 목록과 글 작성 버튼
        <>
          <Button
            variant="contained"
            onClick={() => setIsWriting(true)}
            sx={{ marginBottom: "1rem" }}
          >
            글 작성
          </Button>
          <Box>
            {inquiries.length === 0 ? (
              <Typography color="text.secondary">등록된 글이 없습니다.</Typography>
            ) : (
              inquiries.map((inquiry) => (
                <Card
                  key={inquiry.QUES_IDX}
                  sx={{ marginBottom: "1rem", cursor: "pointer" }}
                  onClick={() => navigate(`/inquiry/${inquiry.QUES_IDX}`)}
                >
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {inquiry.QUES_TITLE}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {inquiry.QUES_CONTENT}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      작성자: {inquiry.USER_NICK} | 조회수: {inquiry.QUES_VIEWS} | 등록일:{" "}
                      {new Date(inquiry.CREATED_AT).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

export default InquirySection;
