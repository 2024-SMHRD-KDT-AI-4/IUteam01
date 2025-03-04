// src/components/CommunityList.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Container, Typography, Button, List, ListItem } from "@mui/material";

const initialPosts = [
  { id: 1, title: "첫 번째 게시글", content: "내용" },
  { id: 2, title: "두 번째 게시글", content: "내용2" },
];

function CommunityList() {
  const [posts] = useState(initialPosts);

  return (
    <Container sx={{ marginTop: 2 }}>
      <Typography variant="h4" gutterBottom>
        커뮤니티 목록
      </Typography>
      <Link to="/community/write" style={{ textDecoration: "none" }}>
        <Button variant="contained" sx={{ marginBottom: 2 }}>
          글쓰기
        </Button>
      </Link>

      <List>
        {posts.map((post) => (
          <ListItem key={post.id}>
            <Link to={`/community/${post.id}`}>{post.title}</Link>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default CommunityList;
