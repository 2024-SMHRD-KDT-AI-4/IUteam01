// src/components/InquirySection.js
import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

function InquirySection() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`문의사항 접수\n제목: ${title}\n내용: ${content}`);
    // 실제로는 서버에 전송하거나 DB에 저장하는 로직을 추가할 수 있음
    setTitle("");
    setContent("");
  };

  return (
    <Box sx={{ padding: "1rem" }}>
      <Typography variant="h5" gutterBottom>
        문의사항
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2, width: 300 }}
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
        <Button type="submit" variant="contained">
          문의하기
        </Button>
      </Box>
    </Box>
  );
}

export default InquirySection;
