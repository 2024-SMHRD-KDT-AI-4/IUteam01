import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, List, ListItem, ListItemText, Button, ButtonGroup, TextField, Box } from "@mui/material";

function NewsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 뉴스 언어 상태: "en" 또는 "ko"
  const [newsLanguage, setNewsLanguage] = useState("en");
  // 입력창에 입력되는 검색어 상태
  const [searchTerm, setSearchTerm] = useState("");
  // 실제 API 호출에 사용할 검색어 (초기값은 "cryptocurrency")
  const [query, setQuery] = useState("Bitcoin");

  useEffect(() => {
    setLoading(true);
    setError(null);
    // 뉴스 API 호출 URL 구성 (NewsAPI.org 예시)
    const API_KEY = "2f4f3eff455d412bbb19b9e2173f4ae7"; // 발급받은 API 키로 교체하세요.
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${newsLanguage}&sortBy=publishedAt&apiKey=${API_KEY}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.status === "ok") {
          setArticles(data.articles);
        } else {
          setError("뉴스 데이터를 불러오는 데 문제가 발생했습니다.");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("뉴스 데이터를 불러오는 중 에러가 발생했습니다.");
        setLoading(false);
      });
  }, [newsLanguage, query]);

  // 검색 제출 시, 입력된 키워드를 사용 (공백이면 기본값 "cryptocurrency")
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchQuery = searchTerm.trim() === "" ? "cryptocurrency" : searchTerm.trim();
    setQuery(searchQuery);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          코인 관련 뉴스
        </Typography>
        {/* 언어 전환 버튼 */}
        <ButtonGroup variant="outlined" sx={{ marginBottom: 2 }}>
          <Button
            onClick={() => setNewsLanguage("en")}
            variant={newsLanguage === "en" ? "contained" : "outlined"}
          >
            해외
          </Button>
          <Button
            onClick={() => setNewsLanguage("ko")}
            variant={newsLanguage === "ko" ? "contained" : "outlined"}
          >
            국내
          </Button>
        </ButtonGroup>
        
        {/* 검색 입력 폼 */}
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ display: "flex", gap: 1, marginBottom: 2 }}
        >
          <TextField
            label="검색어 입력"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained">
            검색
          </Button>
        </Box>

        {loading ? (
          <Typography variant="body2">뉴스 로딩 중...</Typography>
        ) : error ? (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        ) : (
          <List>
            {articles.map((article, index) => (
              <ListItem
                key={index}
                button
                component="a"
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ListItemText
                  primary={article.title}
                  secondary={article.source.name}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default NewsSection;
