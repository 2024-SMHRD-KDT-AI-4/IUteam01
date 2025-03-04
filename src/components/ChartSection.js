// src/components/ChartSection.js
import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

function ChartSection() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">차트 화면</Typography>
        <Typography variant="body2">여기에 코인 차트, RSI, MACD 등</Typography>
      </CardContent>
    </Card>
  );
}

export default ChartSection;
