// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { Box, Typography, Card, CardContent, Button, TextField } from "@mui/material";
// import { useParams, useNavigate } from "react-router-dom";

// function InquiryDetail() {
//   const { id } = useParams();
//   const [inquiry, setInquiry] = useState(null);
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState("");
//   const navigate = useNavigate();

//   // 로그인한 사용자 정보
//   const loggedInUserId = window.localStorage.getItem("userId");
//   const loggedInUserNick = window.localStorage.getItem("nick");
//   const loggedInUserRole = window.localStorage.getItem("role"); // 예: "관리자"

//   // API 호출 중복 방지를 위한 useRef
//   const didFetchRef = useRef(false);

//   useEffect(() => {
//     if (didFetchRef.current) return;
//     didFetchRef.current = true;

//     // 문의 상세 조회 (조회수 1 증가)
//     axios
//       .get(`http://localhost:3307/inquiry/${id}`)
//       .then((res) => setInquiry(res.data))
//       .catch((err) => console.error("문의 상세 조회 오류:", err));

//     // 댓글 목록 불러오기
//     fetchComments();
//   }, [id]);

//   const fetchComments = () => {
//     axios
//       .get(`http://localhost:3307/comments?ques_idx=${id}`)
//       .then((res) => setComments(res.data))
//       .catch((err) => console.error("댓글 불러오기 오류:", err));
//   };

//   // 댓글 등록 함수
//   const handleCommentSubmit = () => {
//     if (!newComment.trim()) {
//       alert("댓글 내용을 입력하세요.");
//       return;
//     }
//     if (!loggedInUserId) {
//       alert("로그인이 필요합니다.");
//       return;
//     }
//     axios
//       .post("http://localhost:3307/comment", {
//         ques_idx: id,
//         comment: newComment,
//         userId: loggedInUserId,
//         userNick: loggedInUserNick,
//       })
//       .then((res) => {
//         if (res.data.success) {
//           setComments([...comments, res.data.newComment]);
//           setNewComment("");
//         } else {
//           alert("댓글 등록에 실패했습니다.");
//         }
//       })
//       .catch((err) => {
//         console.error("댓글 등록 오류:", err);
//         alert("댓글 등록 중 오류가 발생했습니다.");
//       });
//   };

//   // 댓글 삭제 함수
//   const handleCommentDelete = (commentId) => {
//     if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
//     axios
//       .delete(`http://localhost:3307/comment/${commentId}`, {
//         data: { userId: loggedInUserId },
//       })
//       .then((res) => {
//         if (res.data.success) {
//           alert("댓글이 삭제되었습니다.");
//           setComments(comments.filter((comment) => comment.COMMENT_IDX !== commentId));
//         } else {
//           alert("댓글 삭제에 실패했습니다: " + res.data.error);
//         }
//       })
//       .catch((err) => {
//         console.error("댓글 삭제 오류:", err);
//         alert("댓글 삭제 중 오류가 발생했습니다.");
//       });
//   };

//   // 삭제 요청 함수 (문의글 삭제)
//   const handleDelete = () => {
//     if (!loggedInUserId) {
//       alert("로그인이 필요합니다.");
//       return;
//     }
//     if (window.confirm("정말 이 문의를 삭제하시겠습니까?")) {
//       axios
//         .delete(`http://localhost:3307/inquiry/${id}`, {
//           data: { userId: loggedInUserId },
//         })
//         .then((res) => {
//           if (res.data.success) {
//             alert("문의가 삭제되었습니다.");
//             navigate("/", { state: { activeTab: "inquiry" } });
//           } else {
//             alert("삭제에 실패했습니다: " + res.data.error);
//           }
//         })
//         .catch((err) => {
//           console.error("삭제 요청 오류:", err);
//           alert("삭제 요청 중 오류가 발생했습니다.");
//         });
//     }
//   };

//   if (!inquiry) {
//     return <Typography>로딩 중...</Typography>;
//   }

//   // 문의글 삭제 버튼 표시 조건: 작성자 본인 또는 관리자
//   const canDelete = loggedInUserId === inquiry.USER_ID || loggedInUserRole === "관리자";

//   return (
//     <Box sx={{ padding: "1rem", maxWidth: 600, margin: "auto" }}>
//       <Card>
//         <CardContent>
//           <Typography variant="h5" gutterBottom>
//             {inquiry.QUES_TITLE}
//           </Typography>
//           <Typography variant="body1" gutterBottom>
//             {inquiry.QUES_CONTENT}
//           </Typography>
//           {inquiry.QUES_FILE && (
//             <Box sx={{ mt: 2 }}>
//               <a
//                 href={encodeURI(inquiry.QUES_FILE)}
//                 download={inquiry.QUES_ORG_FILE}
//                 style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
//               >
//                 {inquiry.QUES_ORG_FILE}
//               </a>
//             </Box>
//           )}
//           <Typography variant="caption" color="text.secondary">
//             조회수: {inquiry.QUES_VIEWS} | 등록일: {new Date(inquiry.CREATED_AT).toLocaleString()}
//           </Typography>
//         </CardContent>
//       </Card>
//       <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
//         <Button variant="contained" onClick={() => navigate("/", { state: { activeTab: "inquiry" } })}>
//           목록으로 돌아가기
//         </Button>
//         {canDelete && (
//           <Button variant="contained" color="error" onClick={handleDelete}>
//             삭제
//           </Button>
//         )}
//       </Box>

//       {/* 댓글 입력 및 목록 영역 */}
//       <Box sx={{ mt: 4 }}>
//         <Typography variant="h6" gutterBottom>
//           댓글
//         </Typography>
//         <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
//           <TextField
//             label="댓글 입력"
//             variant="outlined"
//             fullWidth
//             value={newComment}
//             onChange={(e) => setNewComment(e.target.value)}
//           />
//           <Button variant="contained" onClick={handleCommentSubmit}>
//             댓글 달기
//           </Button>
//         </Box>
//         {comments.length === 0 ? (
//           <Typography color="text.secondary">등록된 댓글이 없습니다.</Typography>
//         ) : (
//           comments.map((comment) => (
//             <Box
//               key={comment.COMMENT_IDX}
//               sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: "4px" }}
//             >
//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                 <Typography variant="subtitle2" fontWeight="bold">
//                   작성자: {comment.USER_NICK || comment.userNick || "알 수 없음"}
//                 </Typography>
//                 {(loggedInUserId === comment.USER_ID || loggedInUserRole === "관리자") && (
//                   <Button
//                     variant="outlined"
//                     color="error"
//                     size="small"
//                     onClick={() => handleCommentDelete(comment.COMMENT_IDX)}
//                   >
//                     삭제
//                   </Button>
//                 )}
//               </Box>
//               <Typography variant="body2">{comment.COMMENT_CONTENT || comment.comment}</Typography>
//               <Typography variant="caption" color="text.secondary">
//                 {new Date(comment.CREATED_AT).toLocaleString()}
//               </Typography>
//             </Box>
//           ))
//         )}
//       </Box>
//     </Box>
//   );
// }

// export default InquiryDetail;
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Box, Typography, Card, CardContent, Button, TextField } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

function InquiryDetail() {
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const navigate = useNavigate();

  // 로그인한 사용자 정보
  const loggedInUserId = window.localStorage.getItem("userId");
  const loggedInUserNick = window.localStorage.getItem("nick");
  const loggedInUserRole = window.localStorage.getItem("role"); // 예: "관리자"

  // API 호출 중복 방지를 위한 useRef
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    // 문의 상세 조회 (조회수 1 증가)
    axios
      .get(`http://localhost:3307/inquiry/${id}`)
      .then((res) => setInquiry(res.data))
      .catch((err) => console.error("문의 상세 조회 오류:", err));

    // 댓글 목록 불러오기
    fetchComments();
  }, [id]);

  const fetchComments = () => {
    axios
      .get(`http://localhost:3307/comments?ques_idx=${id}`)
      .then((res) => setComments(res.data))
      .catch((err) => console.error("댓글 불러오기 오류:", err));
  };

  // 댓글 등록 함수
  const handleCommentSubmit = () => {
    if (!newComment.trim()) {
      alert("댓글 내용을 입력하세요.");
      return;
    }
    if (!loggedInUserId) {
      alert("로그인이 필요합니다.");
      return;
    }
    axios
      .post("http://localhost:3307/comment", {
        ques_idx: id,
        comment: newComment,
        userId: loggedInUserId,
        userNick: loggedInUserNick,
      })
      .then((res) => {
        if (res.data.success) {
          setComments([...comments, res.data.newComment]);
          setNewComment("");
        } else {
          alert("댓글 등록에 실패했습니다.");
        }
      })
      .catch((err) => {
        console.error("댓글 등록 오류:", err);
        alert("댓글 등록 중 오류가 발생했습니다.");
      });
  };

  // 댓글 삭제 함수
  const handleCommentDelete = (commentId) => {
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;
    axios
      .delete(`http://localhost:3307/comment/${commentId}`, {
        data: { userId: loggedInUserId },
      })
      .then((res) => {
        if (res.data.success) {
          alert("댓글이 삭제되었습니다.");
          setComments(comments.filter((comment) => comment.COMMENT_IDX !== commentId));
        } else {
          alert("댓글 삭제에 실패했습니다: " + res.data.error);
        }
      })
      .catch((err) => {
        console.error("댓글 삭제 오류:", err);
        alert("댓글 삭제 중 오류가 발생했습니다.");
      });
  };

  // 삭제 요청 함수 (문의글 삭제)
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

  // 문의글 삭제 버튼 표시 조건: 작성자 본인 또는 관리자
  const canDelete = loggedInUserId === inquiry.USER_ID || loggedInUserRole === "관리자";

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
                style={{ textDecoration: "none", color: "blue", fontWeight: "bold" }}
              >
                {inquiry.QUES_ORG_FILE}
              </a>
            </Box>
          )}
          <Typography variant="caption" color="text.secondary">
            작성자: {inquiry.USER_NICK} | 조회수: {inquiry.QUES_VIEWS} | 등록일: {new Date(inquiry.CREATED_AT).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
      <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
        <Button variant="contained" onClick={() => navigate("/", { state: { activeTab: "inquiry" } })}>
          목록으로 돌아가기
        </Button>
        {canDelete && (
          <Button variant="contained" color="error" onClick={handleDelete}>
            삭제
          </Button>
        )}
      </Box>

      {/* 댓글 입력 및 목록 영역 */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          댓글
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            label="댓글 입력"
            variant="outlined"
            fullWidth
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button variant="contained" onClick={handleCommentSubmit}>
            댓글 달기
          </Button>
        </Box>
        {comments.length === 0 ? (
          <Typography color="text.secondary">등록된 댓글이 없습니다.</Typography>
        ) : (
          comments.map((comment) => (
            <Box
              key={comment.COMMENT_IDX}
              sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: "4px" }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  작성자: {comment.USER_NICK || comment.userNick || "알 수 없음"}
                </Typography>
                {(loggedInUserId === comment.USER_ID || loggedInUserRole === "관리자") && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleCommentDelete(comment.COMMENT_IDX)}
                  >
                    삭제
                  </Button>
                )}
              </Box>
              <Typography variant="body2">
                {comment.COMMENT_CONTENT || comment.comment}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(comment.CREATED_AT).toLocaleString()}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

export default InquiryDetail;
