import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, TextField, Button, Typography, Card, CardContent } from "@mui/material";

function InquirySection() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [inquiries, setInquiries] = useState([]);

  // 📌 서버에서 문의 목록 불러오기
  useEffect(() => {
    axios
      .get("http://localhost:3307/inquiries") // 서버에서 문의 목록 불러오기
      .then((res) => setInquiries(res.data))
      .catch((err) => console.error("문의 목록 불러오기 오류:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("file", file);
    formData.append("userId", "testUser123"); // 실제 로그인된 사용자 ID 사용

    try {
      const res = await axios.post("http://localhost:3307/inquiry", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        alert("문의가 등록되었습니다.");
        setTitle("");
        setContent("");
        setFile(null);
        setInquiries([res.data.newInquiry, ...inquiries]); // 새 문의 추가
      } else {
        alert("문의 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("문의 등록 오류:", error);
    }
  };

  return (
    <Box sx={{ padding: "1rem", maxWidth: 600, margin: "auto" }}>
      <Typography variant="h5" gutterBottom>
        문의사항
      </Typography>
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
        <Button type="submit" variant="contained">
          문의하기
        </Button>
      </Box>

      {/* 문의 리스트 */}
      <Box sx={{ marginTop: "2rem" }}>
        <Typography variant="h6" gutterBottom>
          문의 목록
        </Typography>
        {inquiries.length === 0 ? (
          <Typography color="text.secondary">등록된 문의가 없습니다.</Typography>
        ) : (
          inquiries.map((inquiry) => (
            <Card key={inquiry.QUES_IDX} sx={{ marginBottom: "1rem" }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  {inquiry.QUES_TITLE}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {inquiry.QUES_CONTENT}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  조회수: {inquiry.QUES_VIEWS} | 등록일: {new Date(inquiry.CREATED_AT).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}

export default InquirySection;
