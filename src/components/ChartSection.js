import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Button, ButtonGroup } from "@mui/material";
import ReactECharts from "echarts-for-react";

function ChartSection() {
  const [chartData, setChartData] = useState([]);
  const [rsiData, setRsiData] = useState([]);
  const [macdData, setMacdData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataType, setDataType] = useState("5min"); // ✅ 현재 선택된 데이터 유형 (5분 or 일별)

  const fetchData = async (type) => {
    try {
      setLoading(true);
      const response = await fetch(type === "5min" ? "/data_5min.json" : "/data_daily.json");
      const data = await response.json();

      // 가격 변동 차트 데이터 가공
      const priceChartData = data.map((item) => [item.date, item.price]);
      const rsiChartData = data.map((item) => [item.date, item.rsi]);
      const macdChartData = data.map((item) => [item.date, item.macd, item.signal]);

      setChartData(priceChartData);
      setRsiData(rsiChartData);
      setMacdData(macdChartData);
      setLoading(false);
    } catch (error) {
      console.error("데이터 로딩 오류:", error);
    }
  };

  useEffect(() => {
    fetchData(dataType); // ✅ 초기 데이터 로드
    const interval = setInterval(() => fetchData(dataType), 180000);
    return () => clearInterval(interval);
  }, [dataType]); // ✅ dataType이 변경될 때마다 데이터 로드

  // ✅ ECharts 옵션 (가격 변동)
  const priceOptions = {
    title: { text: `코인 가격 변동 (${dataType === "5min" ? "5분당" : "일별"})` },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: chartData.map((item) => item[0]), name: "날짜" },
    yAxis: { type: "value", name: "가격" },
    series: [{ data: chartData.map((item) => item[1]), type: "line", smooth: true }],
  };

  // ✅ ECharts 옵션 (RSI)
  const rsiOptions = {
    title: { text: `RSI (상대강도지수) - ${dataType === "5min" ? "5분당" : "일별"}` },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: rsiData.map((item) => item[0]), name: "날짜" },
    yAxis: { type: "value", name: "RSI 값", min: 0, max: 100 },
    series: [{ data: rsiData.map((item) => item[1]), type: "line", smooth: true, color: "blue" }],
  };

  // ✅ ECharts 옵션 (MACD)
  const macdOptions = {
    title: { text: `MACD & Signal (${dataType === "5min" ? "5분당" : "일별"})` },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: macdData.map((item) => item[0]), name: "날짜" },
    yAxis: { type: "value", name: "값" },
    series: [
      { name: "MACD", data: macdData.map((item) => item[1]), type: "line", smooth: true },
      { name: "Signal", data: macdData.map((item) => item[2]), type: "line", smooth: true, color: "red" },
    ],
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">차트 화면</Typography>
        <Typography variant="body2">코인 가격, RSI, MACD 그래프</Typography>

        {/* ✅ 버튼 추가: 5분당 vs 일별 예측 데이터 */}
        <ButtonGroup sx={{ marginBottom: 2 }}>
          <Button variant={dataType === "5min" ? "contained" : "outlined"} onClick={() => setDataType("5min")}>
            5분당 예측 결과
          </Button>
          <Button variant={dataType === "daily" ? "contained" : "outlined"} onClick={() => setDataType("daily")}>
            일별 예측 결과
          </Button>
        </ButtonGroup>

        {loading ? (
          <Typography variant="body2">📊 데이터 로딩 중...</Typography>
        ) : (
          <>
            {/* ✅ 가격 변동 차트 (ECharts) */}
            <ReactECharts option={priceOptions} style={{ height: "300px", width: "100%" }} />

            {/* ✅ RSI 차트 (ECharts) */}
            <ReactECharts option={rsiOptions} style={{ height: "300px", width: "100%" }} />

            {/* ✅ MACD 차트 (ECharts) */}
            <ReactECharts option={macdOptions} style={{ height: "300px", width: "100%" }} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ChartSection;