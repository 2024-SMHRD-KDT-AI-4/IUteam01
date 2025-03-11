import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

function InquiryDetail() {
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const navigate = useNavigate();

  // API 호출 중복 방지를 위한 useRef
  const didFetchRef = useRef(false);

  // 로그인한 사용자 정보
  const loggedInUserId = window.localStorage.getItem("userId");
  const loggedInUserRole = window.localStorage.getItem("role"); // "관리자"이면 관리자 계정

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    axios
      .get(`http://localhost:3307/inquiry/${id}`)
      .then((res) => setInquiry(res.data))
      .catch((err) => console.error("문의 상세 조회 오류:", err));
  }, [id]);

  // 삭제 요청 함수
  const handleDelete = () => {
    if (!loggedInUserId) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (window.confirm("정말 이 문의를 삭제하시겠습니까?")) {
      axios
        .delete(`http://localhost:3307/inquiry/${id}`, {
          data: { userId: loggedInUserId },
        })
        .then((res) => {
          if (res.data.success) {
            alert("문의가 삭제되었습니다.");
            navigate("/", { state: { activeTab: "inquiry" } });
          } else {
            alert("삭제에 실패했습니다: " + res.data.error);
          }
        })
        .catch((err) => {
          console.error("삭제 요청 오류:", err);
          alert("삭제 요청 중 오류가 발생했습니다.");
        });
    }
  };

  if (!inquiry) {
    return <Typography>로딩 중...</Typography>;
  }

  // 삭제 버튼 표시 조건:
  // - 글 작성자와 로그인 사용자가 동일하거나,
  // - 로그인한 사용자의 역할이 "관리자"인 경우
  const canDelete =
    loggedInUserId === inquiry.USER_ID || loggedInUserRole === "관리자";

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
            <Box sx={{ mt: 2 }}>
              <a
                href={encodeURI(inquiry.QUES_FILE)}
                download={inquiry.QUES_ORG_FILE}
                style={{
                  textDecoration: "none",
                  color: "blue",
                  fontWeight: "bold",
                }}
              >
                {inquiry.QUES_ORG_FILE}
              </a>
            </Box>
          )}
          <Typography variant="caption" color="text.secondary">
            조회수: {inquiry.QUES_VIEWS} | 등록일:{" "}
            {new Date(inquiry.CREATED_AT).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          onClick={() => navigate("/", { state: { activeTab: "inquiry" } })}
        >
          목록으로 돌아가기
        </Button>
        {canDelete && (
          <Button variant="contained" color="error" onClick={handleDelete}>
            삭제
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default InquiryDetail;
