// src/components/NewsSection.js
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

function NewsSection() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">뉴스 화면</Typography>
        <Typography variant="body2">코인 관련 최신 뉴스를 표시</Typography>
      </CardContent>
    </Card>
  );
}

export default NewsSection;
