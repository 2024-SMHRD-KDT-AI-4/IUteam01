from flask import Flask, request, jsonify
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def ema(prices, period):
    """EMA 계산 (초기값은 첫 번째 가격 사용)"""
    k = 2 / (period + 1)
    ema_values = [prices[0]]
    for price in prices[1:]:
        ema_values.append(price * k + ema_values[-1] * (1 - k))
    return ema_values

def compute_rsi(prices, period=14):
    """RSI 계산 (초기 period는 None 처리)"""
    if len(prices) < period:
        return [None] * len(prices)
    rsi = [None] * len(prices)
    changes = [prices[i] - prices[i - 1] for i in range(1, len(prices))]
    gains = [max(change, 0) for change in changes]
    losses = [abs(min(change, 0)) for change in changes]
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period
    rsi[period] = 100 - (100 / (1 + (avg_gain / avg_loss))) if avg_loss != 0 else 100
    for i in range(period + 1, len(prices)):
        gain = gains[i - 1]
        loss = losses[i - 1]
        avg_gain = (avg_gain * (period - 1) + gain) / period
        avg_loss = (avg_loss * (period - 1) + loss) / period
        rsi[i] = 100 - (100 / (1 + (avg_gain / avg_loss))) if avg_loss != 0 else 100
    return rsi

def compute_macd(prices, short_period=12, long_period=26, signal_period=9):
    """MACD와 Signal 계산"""
    ema_short = ema(prices, short_period)
    ema_long = ema(prices, long_period)
    macd_line = [s - l for s, l in zip(ema_short, ema_long)]
    signal_line = ema(macd_line, signal_period)
    return macd_line, signal_line

@app.route("/api/bitcoin_data")
def bitcoin_data():
    # 쿼리 파라미터 type: "5min" 또는 "daily" (기본은 "5min")
    type_param = request.args.get("type", "5min")
    if type_param == "5min":
        url = "https://api.upbit.com/v1/candles/minutes/5"
    elif type_param == "daily":
        url = "https://api.upbit.com/v1/candles/days"
    else:
        return jsonify({"error": "Invalid type parameter. Use '5min' or 'daily'."}), 400

    # 기본 200개의 데이터를 요청
    count = request.args.get("count", 200)
    try:
        count = int(count)
    except ValueError:
        count = 200

    params = {"market": "KRW-BTC", "count": count}
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return jsonify({"error": "Failed to retrieve data from Upbit API"}), 500

    data = response.json()
    # Upbit API는 최신 데이터가 앞에 있으므로, 계산을 위해 오래된 순으로 정렬
    data.reverse()
    prices = [item["trade_price"] for item in data]

    # 지표 계산
    rsi_values = compute_rsi(prices, period=14)
    macd_values, signal_values = compute_macd(prices, short_period=12, long_period=26, signal_period=9)

    transformed_data = []
    for idx, item in enumerate(data):
        transformed_data.append({
            "date": item["candle_date_time_kst"],
            "price": item["trade_price"],
            "rsi": rsi_values[idx] if idx < len(rsi_values) else None,
            "macd": macd_values[idx] if idx < len(macd_values) else None,
            "signal": signal_values[idx] if idx < len(signal_values) else None
        })

    return jsonify(transformed_data)

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
