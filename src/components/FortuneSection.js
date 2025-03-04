// src/components/FortuneSection.js
import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";

function FortuneSection() {
  const fortunes = [
    "오늘은 새로운 기회가 생길 수도!",
    "즐거운 일이 생길 듯한 하루!",
    "큰 지출이 예상되니 조심합시다!",
    "귀인이 나타날 수 있어요. 주변에 주목!"
  ];
  const [fortune, setFortune] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    setFortune(fortunes[randomIndex]);
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">🔮 오늘의 운세</Typography>
        <Typography>{fortune}</Typography>
      </CardContent>
    </Card>
  );
}

export default FortuneSection;
