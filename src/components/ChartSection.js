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
  Box,
  Divider
} from "@mui/material";
import ReactECharts from "echarts-for-react";

function ChartSection() {
  const [dataType, setDataType] = useState("5min");
  const [chartData, setChartData] = useState([]);
  const [rsiData, setRsiData] = useState([]);
  const [macdData, setMacdData] = useState([]);
  const [trendData, setTrendData] = useState({ up_prob: 50, down_prob: 50 });
  const [loading, setLoading] = useState(false);
  const [coinSymbol, setCoinSymbol] = useState("BTC");

  const coins = [
    { symbol: "BTC", name: "비트코인" },
    { symbol: "ETH", name: "이더리움" },
    { symbol: "BCH", name: "비트코인 캐시" },
    { symbol: "SOL", name: "솔라나" },
    { symbol: "ENS", name: "이더리움 네임 서비스" },
    { symbol: "ETC", name: "이더리움 클래식" },
    { symbol: "XRP", name: "리플" }
  ];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const market = `KRW-${coinSymbol.toUpperCase()}`;
      const response = await fetch(`http://localhost:5000/api/bitcoin_data?type=${dataType}&market=${market}`);
      const data = await response.json();

      setChartData(data.map(item => [item.date, item.price]));
      setRsiData(data.map(item => [item.date, item.rsi]));
      setMacdData(data.map(item => [item.date, item.macd, item.signal]));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  }, [dataType, coinSymbol]);

  const fetchTrendData = useCallback(async () => {
    try {
      const market = `KRW-${coinSymbol.toUpperCase()}`;
      const response = await fetch(`http://localhost:5000/api/coin_trend?market=${market}`);
      const data = await response.json();
      setTrendData(data);
    } catch (error) {
      console.error("Error fetching trend data:", error);
    }
  }, [coinSymbol]);

  // 업데이트 버튼에서 두 API를 함께 호출하도록 함수를 정의합니다.
  const updateAll = useCallback(() => {
    fetchData();
    fetchTrendData();
  }, [fetchData, fetchTrendData]);

  useEffect(() => {
    updateAll();
  }, [updateAll]);

  // coins 배열에서 선택된 코인의 정보를 찾아 제목에 포함합니다.
  const selectedCoin = coins.find(coin => coin.symbol === coinSymbol);
  const title = selectedCoin
    ? `${selectedCoin.symbol} (${selectedCoin.name}) 상승/하락 확률`
    : `${coinSymbol} 상승/하락 확률`;

  return (
    <Card sx={{ marginBottom: "20px" }}>
      <CardContent>
        {/* 📊 상승/하락 확률 차트 (맨 위) */}
        <Typography variant="h5" align="center" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
          {title}
        </Typography>
        <ReactECharts
          option={{
            title: { text: "📊 상승/하락 확률", left: "center" },
            tooltip: { trigger: "item", formatter: "{b} : {c}%" },
            series: [
              {
                type: "pie",
                radius: "65%",
                data: [
                  { value: trendData.up_prob, name: "📈 상승 가능성" },
                  { value: trendData.down_prob, name: "📉 하락 가능성" }
                ],
                emphasis: {
                  itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" }
                }
              }
            ]
          }}
          style={{ height: "350px", width: "100%" }}
        />

        <Divider sx={{ margin: "20px 0" }} />

        {/* 📈 가격, RSI, MACD 차트 (아래 정렬) */}
        <Typography variant="h5" align="center" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
          {coinSymbol.toUpperCase()} {dataType === "5min" ? "5분봉 차트" : "일봉 차트"}
        </Typography>

        <FormControl fullWidth sx={{ marginBottom: "1rem" }}>
          <InputLabel id="coin-select-label">코인 선택</InputLabel>
          <Select
            labelId="coin-select-label"
            id="coin-select"
            value={coinSymbol}
            onChange={(e) => setCoinSymbol(e.target.value)}
          >
            {coins.map((coin) => (
              <MenuItem key={coin.symbol} value={coin.symbol}>
                {coin.symbol} ({coin.name})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 2 }}>
          <ButtonGroup>
            <Button variant={dataType === "5min" ? "contained" : "outlined"} onClick={() => setDataType("5min")}>
              5분봉
            </Button>
            <Button variant={dataType === "daily" ? "contained" : "outlined"} onClick={() => setDataType("daily")}>
              일봉
            </Button>
          </ButtonGroup>
          <Button variant="contained" onClick={updateAll}>
            🔄 업데이트
          </Button>
        </Box>

        {loading ? (
          <Typography align="center">📊 데이터 로딩 중...</Typography>
        ) : (
          <>
            {chartData.length > 0 && (
              <ReactECharts
                option={{
                  title: { text: "📈 코인 가격 변동", left: "center" },
                  tooltip: { trigger: "axis" },
                  xAxis: { type: "category", data: chartData.map(item => item[0]) },
                  yAxis: { type: "value", name: "가격" },
                  series: [{ data: chartData.map(item => item[1]), type: "line", smooth: true }]
                }}
                style={{ height: "300px", width: "100%" }}
              />
            )}

            <Divider sx={{ margin: "10px 0" }} />

            {rsiData.length > 0 && (
              <ReactECharts
                option={{
                  title: { text: "📊 RSI 지표", left: "center" },
                  tooltip: { trigger: "axis" },
                  xAxis: { type: "category", data: rsiData.map(item => item[0]) },
                  yAxis: { type: "value", name: "RSI 값", min: 0, max: 100 },
                  series: [{ data: rsiData.map(item => item[1]), type: "line", smooth: true }]
                }}
                style={{ height: "250px", width: "100%" }}
              />
            )}

            <Divider sx={{ margin: "10px 0" }} />

            {macdData.length > 0 && (
              <ReactECharts
                option={{
                  title: { text: "📉 MACD & Signal", left: "center" },
                  tooltip: { trigger: "axis" },
                  xAxis: { type: "category", data: macdData.map(item => item[0]) },
                  yAxis: { type: "value", name: "값" },
                  series: [
                    { name: "MACD", data: macdData.map(item => item[1]), type: "line", smooth: true },
                    { name: "Signal", data: macdData.map(item => item[2]), type: "line", smooth: true, color: "red" }
                  ]
                }}
                style={{ height: "250px", width: "100%" }}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ChartSection;
