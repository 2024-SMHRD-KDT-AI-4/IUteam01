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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

function ChartSection() {
  const [dataType, setDataType] = useState("5min");
  const [chartData, setChartData] = useState([]); // 캔들차트: [date, open, close, low, high]
  const [rsiData, setRsiData] = useState([]);
  const [macdData, setMacdData] = useState([]);
  const [trendData, setTrendData] = useState({ up_prob: 50, down_prob: 50 });
  const [loading, setLoading] = useState(false);
  const [coinSymbol, setCoinSymbol] = useState("BTC");
  const [openDialog, setOpenDialog] = useState(false); // 모달 상태 추가

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

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
          <InputLabel id="coin-select-label" sx={{ transform: "translateY(-20px)" }}>코인 선택</InputLabel>
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
          <Button variant="contained" onClick={handleOpenDialog}>
            ℹ️ 차트 설명
          </Button>
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
                    data: chartData.map(item => 
                      dataType === "5min" 
                        ? new Date(item[0]).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) // HH:mm 형식
                        : new Date(item[0]).toISOString().split("T")[0] // YYYY-MM-DD 형식
                    ), // 05:20:20 형태로 표시
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
                  xAxis: { type: "category", data: chartData.map(item => 
                    dataType === "5min" 
                      ? new Date(item[0]).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) // HH:mm 형식
                      : new Date(item[0]).toISOString().split("T")[0] // YYYY-MM-DD 형식
                  )},
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
                  xAxis: { type: "category", data: chartData.map(item => 
                    dataType === "5min" 
                      ? new Date(item[0]).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) // HH:mm 형식
                      : new Date(item[0]).toISOString().split("T")[0] // YYYY-MM-DD 형식
                  ) },
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
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md" // 최대 너비를 중간 크기로 설정
          fullWidth // 전체 너비를 사용하여 화면을 꽉 채우도록
        >
          <DialogTitle>차트 설명</DialogTitle>
          <DialogContent sx={{ padding: 4 }}>  {/* 내용에 여백을 추가하여 더 여유롭게 보이도록 */}
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              📢 코인 분석 지표 안내
              안녕하세요! 📊 이 페이지에서는 MACD & Signal 지표, 캔들차트 기반 RSI 지표, 그리고 우리가 개발한 머신러닝 모델을 활용하여 코인의 상승 및 하락 확률을 분석해 드립니다.
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              🔹 1. MACD & Signal 지표란?
              MACD(이동 평균 수렴·발산)는 단기 이동평균선과 장기 이동평균선의 차이를 활용하여 시장의 흐름을 분석하는 지표입니다.
              MACD가 Signal 선을 상향 돌파하면 상승 신호 📈
              MACD가 Signal 선을 하향 돌파하면 하락 신호 📉
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              🔹 2. RSI(Relative Strength Index) 지표란?
              RSI(상대 강도 지수)는 최근 가격 변동을 기준으로 과매수·과매도 상태를 분석하는 지표입니다.
              RSI 70 이상 → 과매수 상태, 하락 가능성 증가 ⚠️
              RSI 30 이하 → 과매도 상태, 상승 가능성 증가 ✅
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              🔹 3. 머신러닝 모델 예측
              우리는 다양한 코인 시장 데이터를 학습하여 코인의 상승 및 하락 확률을 예측하는 머신러닝 모델을 개발하였습니다.
              과거 패턴을 분석하여 현재 시장의 상승·하락 확률을 수치로 제공합니다.
              다양한 지표와 함께 확인하면 보다 정확한 투자 판단을 내리는 데 도움이 됩니다!
              💡 이 지표들은 투자 판단의 참고 자료일 뿐이며, 최종적인 투자 결정은 신중하게 진행해 주세요!
              🚀 이제 원하는 코인을 선택하고 분석을 시작해 보세요! 🔍
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 2 }}>
              🔹 머신러닝 모델의 예측은 정각을 기준으로 5분마다 실행되며 이후 5분간의 그래프 변동에 대해 예측을 진행합니다!
              
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              닫기
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>

    </Card>

  );
}

export default ChartSection;

