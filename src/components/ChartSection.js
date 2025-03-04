import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { Chart } from "react-google-charts";

function ChartSection() {
  const [chartData, setChartData] = useState([]);
  const [rsiData, setRsiData] = useState([]);
  const [macdData, setMacdData] = useState([]);

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        // 가격 변동 차트 데이터 가공
        const priceChartData = [["날짜", "가격"]];
        data.forEach((item) => {
          priceChartData.push([item.date, item.price]);
        });

        // RSI 차트 데이터 가공
        const rsiChartData = [["날짜", "RSI"]];
        data.forEach((item) => {
          rsiChartData.push([item.date, item.rsi]);
        });

        // MACD 차트 데이터 가공
        const macdChartData = [["날짜", "MACD", "Signal"]];
        data.forEach((item) => {
          macdChartData.push([item.date, item.macd, item.signal]);
        });

        setChartData(priceChartData);
        setRsiData(rsiChartData);
        setMacdData(macdChartData);
      })
      .catch((error) => console.error("데이터 로딩 오류:", error));
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5">차트 화면</Typography>
        <Typography variant="body2">코인가격, RSI, MACD 그래프</Typography>

        {/* 가격 변동 차트 */}
        <Chart
          width={"100%"}
          height={"300px"}
          chartType="LineChart"
          loader={<div>Loading Chart...</div>}
          data={chartData}
          options={{
            title: "코인 가격 변동",
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
            title: "RSI (상대강도지수)",
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
            title: "MACD & Signal",
            hAxis: { title: "날짜" },
            vAxis: { title: "값" },
            seriesType: "line",
            series: { 1: { type: "line", color: "red" } },
          }}
        />
      </CardContent>
    </Card>
  );
}

export default ChartSection;