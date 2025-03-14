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
  const [chartData, setChartData] = useState([]); // 캔들차트: [date, open, close, low, high]
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
    { symbol: "NEO", name: "네오" },
    { symbol: "TRUMP", name: "트럼프" },
    { symbol: "STRIKE", name: "스트라이크" },
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


      // 캔들차트 데이터: [date, open, close, low, high]
      setChartData(data.map(item => [item.date, item.open, item.close, item.low, item.high]));
      // RSI 데이터: [date, rsi]
      setRsiData(data.map(item => [item.date, item.rsi]));
      // MACD 데이터: [date, macd, signal]
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

  const updateAll = useCallback(() => {
    fetchData();
    fetchTrendData();
  }, [fetchData, fetchTrendData]);

  useEffect(() => {
    updateAll();
  }, [updateAll]);

  const selectedCoin = coins.find(coin => coin.symbol === coinSymbol);
  const title = selectedCoin
    ? `${selectedCoin.symbol} (${selectedCoin.name}) 상승/하락 확률`
    : `${coinSymbol} 상승/하락 확률`;

  return (
    <Card sx={{ marginBottom: "20px" }}>
      <CardContent>
        {/* 상승/하락 확률 파이 차트 */}
        <Typography variant="h5" align="center" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
          {title}
        </Typography>
        <ReactECharts
          option={{
            title: {
              text: "📊 상승/하락 확률",
              left: "center",
              subtext: `예측 시간: ${trendData.prediction_time}`, // 예측 시간 추가
              subtextStyle: { fontSize: 12, color: "#666" } // 스타일 지정
            },
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
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)"
                  }
                }
              }
            ]
          }}
          style={{ height: "350px", width: "100%" }}
        />


        <Divider sx={{ margin: "20px 0" }} />

        {/* 캔들차트 */}
        <Typography variant="h5" align="center" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
          {coinSymbol.toUpperCase()} {dataType === "5min" ? "5분봉 캔들차트" : "일봉 캔들차트"}
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
              5분단위
            </Button>
            <Button variant={dataType === "daily" ? "contained" : "outlined"} onClick={() => setDataType("daily")}>
              1일단위
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
                  title: { text: "📈 캔들차트", left: "center" },
                  tooltip: {
                    trigger: "axis",
                    formatter: function (params) {
                      const item = params[0];
                      return [
                        "날짜: " + item.axisValue,
                        "시가: " + item.data[1].toLocaleString(),
                        "종가: " + item.data[2].toLocaleString(),
                        "최저가: " + item.data[3].toLocaleString(),
                        "최고가: " + item.data[4].toLocaleString()
                      ].join("<br/>");
                    }
                  },
                  xAxis: {
                    type: "category",
                    // item[0]에서 시간만 추출하여 표시
                    data: chartData.map(item => new Date(item[0]).toLocaleTimeString()), // 05:20:20 형태로 표시
                    scale: true,
                    boundaryGap: false,
                    axisLine: { onZero: false },
                    splitLine: { show: false },
                    splitNumber: 20,
                    min: "dataMin",
                    max: "dataMax"
                  },
                  yAxis: {
                    scale: true,
                    splitArea: { show: true }
                  },
                  series: [
                    {
                      name: "가격",
                      type: "candlestick",
                      data: chartData.map(item => [item[1], item[2], item[3], item[4]]),
                      itemStyle: {
                        color: "#06B800",
                        color0: "#FA0000",
                        borderColor: "#06B800",
                        borderColor0: "#FA0000"
                      }
                    }
                  ]
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
                  xAxis: { type: "category", data: rsiData.map(item => new Date(item[0]).toLocaleTimeString()) },
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
                  xAxis: { type: "category", data: macdData.map(item => new Date(item[0]).toLocaleTimeString()) },
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
