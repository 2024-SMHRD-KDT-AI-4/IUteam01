// src/components/PostDetail.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Typography, Button } from "@mui/material";

const allPosts = [
  { id: 1, title: "첫 번째 게시글", content: "내용" },
  { id: 2, title: "두 번째 게시글", content: "내용2" },
];

function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const found = allPosts.find((p) => p.id === Number(id));
    setPost(found);
  }, [id]);

  if (!post) {
    return (
      <Container sx={{ marginTop: 2 }}>
        <Typography variant="h5">게시글이 존재하지 않습니다.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ marginTop: 2 }}>
      <Typography variant="h4">{post.title}</Typography>
      <Typography variant="body1" sx={{ marginTop: 2 }}>
        {post.content}
      </Typography>
      <Link to="/community" style={{ textDecoration: "none" }}>
        <Button variant="contained" sx={{ marginTop: 2 }}>
          목록으로
        </Button>
      </Link>
    </Container>
  );
}

export default PostDetail;
