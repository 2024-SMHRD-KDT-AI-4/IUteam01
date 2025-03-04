// src/components/PostWrite.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box
} from "@mui/material";

function PostWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // 실제론 백엔드에 POST 요청해서 저장
    alert(`새 글 작성!\n제목: ${title}\n내용: ${content}`);
    navigate("/community");
  };

  return (
    <Container sx={{ marginTop: 2 }}>
      <Typography variant="h4" gutterBottom>
        글쓰기
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <TextField
          label="내용"
          multiline
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <Button variant="contained" type="submit">
          등록
        </Button>
      </Box>
    </Container>
  );
}

export default PostWrite;
