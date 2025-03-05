import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Button, ButtonGroup } from "@mui/material";
import { Chart } from "react-google-charts";

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
      const priceChartData = [["날짜", "가격"], ...data.map(item => [item.date, item.price])];

      // RSI 차트 데이터 가공
      const rsiChartData = [["날짜", "RSI"], ...data.map(item => [item.date, item.rsi])];

      // MACD 차트 데이터 가공
      const macdChartData = [["날짜", "MACD", "Signal"], ...data.map(item => [item.date, item.macd, item.signal])];

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
            {/* 가격 변동 차트 */}
            <Chart
              width={"100%"}
              height={"300px"}
              chartType="LineChart"
              loader={<div>Loading Chart...</div>}
              data={chartData}
              options={{
                title: `코인 가격 변동 (${dataType === "5min" ? "5분당" : "일별"})`,
                hAxis: { title: "날짜" },
                vAxis: { title: "가격" },
                legend: "none",
              }}
            />

            {/* RSI 차트 */}
            <Chart
              width={"100%"}
              height={"300px"}
              chartType="LineChart"
              loader={<div>Loading Chart...</div>}
              data={rsiData}
              options={{
                title: `RSI (상대강도지수) - ${dataType === "5min" ? "5분당" : "일별"}`,
                hAxis: { title: "날짜" },
                vAxis: { title: "RSI 값", minValue: 0, maxValue: 100 },
                legend: "none",
              }}
            />

            {/* MACD 차트 */}
            <Chart
              width={"100%"}
              height={"300px"}
              chartType="ComboChart"
              loader={<div>Loading Chart...</div>}
              data={macdData}
              options={{
                title: `MACD & Signal (${dataType === "5min" ? "5분당" : "일별"})`,
                hAxis: { title: "날짜" },
                vAxis: { title: "값" },
                seriesType: "line",
                series: { 1: { type: "line", color: "red" } },
              }}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ChartSection;