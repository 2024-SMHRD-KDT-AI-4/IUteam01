import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Button, ButtonGroup } from "@mui/material";
import ReactECharts from "echarts-for-react";

function ChartSection() {
  const [chartData, setChartData] = useState([]);
  const [rsiData, setRsiData] = useState([]);
  const [macdData, setMacdData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataType, setDataType] = useState("5min");

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(dataType === "5min" ? "/data_5min.json" : "/data_daily.json");
      const data = await response.json();

      setChartData(data.map((item) => [item.date, item.price]));
      setRsiData(data.map((item) => [item.date, item.rsi]));
      setMacdData(data.map((item) => [item.date, item.macd, item.signal]));
      setLoading(false);
    } catch (error) {
      console.error("데이터 로딩 오류:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dataType]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">차트 화면</Typography>
        <Typography variant="body2">코인 가격, RSI, MACD 그래프</Typography>

        <ButtonGroup sx={{ marginBottom: 2 }}>
          <Button variant={dataType === "5min" ? "contained" : "outlined"} onClick={() => setDataType("5min")}>
            5분당 예측 결과
          </Button>
          <Button variant={dataType === "daily" ? "contained" : "outlined"} onClick={() => setDataType("daily")}>
            일별 예측 결과
          </Button>
        </ButtonGroup>

        {/* 업데이트 버튼 추가 */}
        <Button variant="contained" onClick={fetchData} sx={{ marginBottom: 2, marginLeft: 2 }}>
          🔄 업데이트
        </Button>

        {loading ? (
          <Typography variant="body2">📊 데이터 로딩 중...</Typography>
        ) : (
          <>
            <ReactECharts option={{
              title: { text: `코인 가격 변동 (${dataType === "5min" ? "5분당" : "일별"})` },
              tooltip: { trigger: "axis" },
              xAxis: { type: "category", data: chartData.map((item) => item[0]), name: "날짜" },
              yAxis: { type: "value", name: "가격" },
              series: [{ data: chartData.map((item) => item[1]), type: "line", smooth: true }],
            }} style={{ height: "300px", width: "100%" }} />

            <ReactECharts option={{
              title: { text: `RSI (상대강도지수) - ${dataType === "5min" ? "5분당" : "일별"}` },
              tooltip: { trigger: "axis" },
              xAxis: { type: "category", data: rsiData.map((item) => item[0]), name: "날짜" },
              yAxis: { type: "value", name: "RSI 값", min: 0, max: 100 },
              series: [{ data: rsiData.map((item) => item[1]), type: "line", smooth: true, color: "blue" }],
            }} style={{ height: "300px", width: "100%" }} />

            <ReactECharts option={{
              title: { text: `MACD & Signal (${dataType === "5min" ? "5분당" : "일별"})` },
              tooltip: { trigger: "axis" },
              xAxis: { type: "category", data: macdData.map((item) => item[0]), name: "날짜" },
              yAxis: { type: "value", name: "값" },
              series: [
                { name: "MACD", data: macdData.map((item) => item[1]), type: "line", smooth: true },
                { name: "Signal", data: macdData.map((item) => item[2]), type: "line", smooth: true, color: "red" },
              ],
            }} style={{ height: "300px", width: "100%" }} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ChartSection;
