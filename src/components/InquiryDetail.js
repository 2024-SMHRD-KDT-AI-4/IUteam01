// src/components/InquiryDetail.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

function InquiryDetail() {
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:3307/inquiry/${id}`)
      .then((res) => setInquiry(res.data))
      .catch((err) => console.error("문의 상세 조회 오류:", err));
  }, [id]);

  if (!inquiry) {
    return <Typography>로딩 중...</Typography>;
  }

  return (
    <Box sx={{ padding: "1rem", maxWidth: 600, margin: "auto" }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {inquiry.QUES_TITLE}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {inquiry.QUES_CONTENT}
          </Typography>
          {inquiry.QUES_FILE && (
            <Box
              component="img"
              src={inquiry.QUES_FILE}
              alt="첨부파일"
              sx={{ maxWidth: "100%", mt: 2 }}
            />
          )}
          <Typography variant="caption" color="text.secondary">
            조회수: {inquiry.QUES_VIEWS} | 등록일:{" "}
            {new Date(inquiry.CREATED_AT).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
      <Button
        variant="contained"
        onClick={() => navigate("/", { state: { activeTab: "inquiry" } })}
        sx={{ mt: 2 }}
      >
        목록으로 돌아가기
      </Button>
    </Box>
  );
}

export default InquiryDetail;
