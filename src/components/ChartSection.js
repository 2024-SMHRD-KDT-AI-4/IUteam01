// src/components/ChartSection.js
import React, { useCallback, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from "@mui/material";
import ReactECharts from "echarts-for-react";

function ChartSection() {
  const [dataType, setDataType] = useState("5min");
  const [chartData, setChartData] = useState([]);
  const [rsiData, setRsiData] = useState([]);
  const [macdData, setMacdData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 기본 선택 코인은 BTC
  const [coinSymbol, setCoinSymbol] = useState("BTC");

  // 코인 목록: 심볼과 한국어 이름을 함께 저장
  const coins = [
    { symbol: "BTC", name: "비트코인" },
    { symbol: "ETH", name: "이더리움" },
    { symbol: "BCH", name: "비트코인 캐시" },
    { symbol: "SOL", name: "솔라나" },
    { symbol: "ENS", name: "이더리움 네임 서비스" },
    { symbol: "ETC", name: "이더리움 클래식" },
    { symbol: "TRUMPO", name: "트럼포" },
    { symbol: "NEO", name: "네오" },
    { symbol: "STRIKE", name: "스트라이크" },
    { symbol: "XRP", name: "리플" }
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Upbit API는 KRW-코인 형식으로 market 파라미터를 사용합니다.
      const market = `KRW-${coinSymbol.toUpperCase()}`;
      const response = await fetch(`http://localhost:5000/api/bitcoin_data?type=${dataType}&market=${market}`);
      const data = await response.json();
      console.log("Fetched data:", data);
      setChartData(data.map(item => [item.date, item.price]));
      setRsiData(data.map(item => [item.date, item.rsi]));
      setMacdData(data.map(item => [item.date, item.macd, item.signal]));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, [dataType, coinSymbol]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCoinChange = (e) => {
    setCoinSymbol(e.target.value);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">
          {dataType === "5min"
            ? `${coinSymbol.toUpperCase()} 5분봉 차트`
            : `${coinSymbol.toUpperCase()} 일봉 차트`}
        </Typography>
        <Typography variant="body2">
          {coinSymbol.toUpperCase()}의 가격, RSI, MACD를 표시합니다.
        </Typography>
        {/* 코인 선택 드롭다운 */}
        <FormControl fullWidth sx={{ margin: "1rem 0" }}>
          <InputLabel id="coin-select-label">코인 선택</InputLabel>
          <Select
            labelId="coin-select-label"
            id="coin-select"
            value={coinSymbol}
            label="코인 선택"
            onChange={handleCoinChange}
          >
            {coins.map((coin) => (
              <MenuItem key={coin.symbol} value={coin.symbol}>
                {coin.symbol} ({coin.name})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 버튼들을 한 줄에 정렬 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
          <ButtonGroup>
            <Button
              variant={dataType === "5min" ? "contained" : "outlined"}
              onClick={() => setDataType("5min")}
            >
              5분봉
            </Button>
            <Button
              variant={dataType === "daily" ? "contained" : "outlined"}
              onClick={() => setDataType("daily")}
            >
              일봉
            </Button>
          </ButtonGroup>
          <Button variant="contained" onClick={fetchData}>
            🔄 업데이트
          </Button>
        </Box>

        {loading ? (
          <Typography variant="body2">데이터 로딩 중...</Typography>
        ) : (
          <>
            {chartData.length > 0 && (
              <ReactECharts
                key={`chart-${chartData.length}`}
                option={{
                  title: {
                    text: dataType === "5min"
                      ? `${coinSymbol.toUpperCase()} 가격 (5분봉)`
                      : `${coinSymbol.toUpperCase()} 가격 (일봉)`
                  },
                  tooltip: { trigger: "axis" },
                  xAxis: {
                    type: "category",
                    data: chartData.map(item => item[0]),
                    name: "날짜"
                  },
                  yAxis: { type: "value", name: "가격" },
                  series: [{
                    data: chartData.map(item => item[1]),
                    type: "line",
                    smooth: true
                  }]
                }}
                style={{ height: "300px", width: "100%" }}
              />
            )}

            {rsiData.length > 0 && (
              <ReactECharts
                key={`rsi-${rsiData.length}`}
                option={{
                  title: {
                    text: dataType === "5min"
                      ? `${coinSymbol.toUpperCase()} RSI (5분봉)`
                      : `${coinSymbol.toUpperCase()} RSI (일봉)`
                  },
                  tooltip: { trigger: "axis" },
                  xAxis: {
                    type: "category",
                    data: rsiData.map(item => item[0]),
                    name: "날짜"
                  },
                  yAxis: { type: "value", name: "RSI 값", min: 0, max: 100 },
                  series: [{
                    data: rsiData.map(item => item[1]),
                    type: "line",
                    smooth: true,
                    color: "blue"
                  }]
                }}
                style={{ height: "300px", width: "100%" }}
              />
            )}

            {macdData.length > 0 && (
              <ReactECharts
                key={`macd-${macdData.length}`}
                option={{
                  title: {
                    text: dataType === "5min"
                      ? `${coinSymbol.toUpperCase()} MACD & Signal (5분봉)`
                      : `${coinSymbol.toUpperCase()} MACD & Signal (일봉)`
                  },
                  tooltip: { trigger: "axis" },
                  xAxis: {
                    type: "category",
                    data: macdData.map(item => item[0]),
                    name: "날짜"
                  },
                  yAxis: { type: "value", name: "값" },
                  series: [
                    {
                      name: "MACD",
                      data: macdData.map(item => item[1]),
                      type: "line",
                      smooth: true
                    },
                    {
                      name: "Signal",
                      data: macdData.map(item => item[2]),
                      type: "line",
                      smooth: true,
                      color: "red"
                    }
                  ]
                }}
                style={{ height: "300px", width: "100%" }}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ChartSection;
