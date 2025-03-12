import threading
import time
import os
import pandas as pd
import numpy as np
import joblib
import requests
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler
from flask import Flask, request, jsonify
from flask_cors import CORS

############################################
# Utility Functions: EMA, RSI, MACD 계산
############################################

def ema(prices, period):
    k = 2 / (period + 1)
    ema_values = [prices[0]]
    for price in prices[1:]:
        ema_values.append(price * k + ema_values[-1] * (1 - k))
    return ema_values

def compute_rsi(prices, period=14):
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
    ema_short = ema(prices, short_period)
    ema_long = ema(prices, long_period)
    macd_line = [s - l for s, l in zip(ema_short, ema_long)]
    signal_line = ema(macd_line, signal_period)
    return macd_line, signal_line

############################################
# Global Variables and Settings
############################################

# 10개 코인 리스트
coins_list = ["BTC", "ETH", "BCH", "SOL", "NEO", "TRUMP", "STRIKE", "ENS", "ETC", "XRP"]

# 코인별 최신 예측 결과 저장 (예: latest_prediction["BTC"] = { ... })
latest_prediction = {}

# 코인별 모델들을 저장할 딕셔너리 (동적 로드)
models_dict = {}

# 공통 Feature 목록 (모든 코인에 대해 동일하다고 가정)
selected_features_up = [
    'Price_Change_1', 'Price_Change_3', 'MACD_Change', 'RSI_Change', 'RSI_Change_3',
    'Stochastic', 'Rebound_Signal', 'Peak_Signal', '3EMA', '10EMA', 'MACD'
]
selected_features_down = [
    'Price_Change_1', 'MACD_Change', 'MACD_Change_3', 'RSI_Change',
    'Strong_Peak_Signal', 'Sudden_Price_Drop', 'Failed_10EMA_Breakout',
    '6EMA', 'Stochastic'
]
ALL_FEATURES = list(set(selected_features_up + selected_features_down))

############################################
# Model Loading Function (Dynamic)
############################################

def load_models_for_all_coins():
    for coin in coins_list:
        try:
            models_dict[coin] = {
                "scaler_up": joblib.load(f"scaler_up_{coin}.pkl"),
                "scaler_down": joblib.load(f"scaler_down_{coin}.pkl"),
                "xgb_up": joblib.load(f"xgb_up_{coin}.pkl"),
                "xgb_down": joblib.load(f"xgb_down_{coin}.pkl")
            }
            print(f"[{coin}] 모델 로드 성공")
        except Exception as e:
            print(f"[{coin}] 모델 로드 실패: {e}")

load_models_for_all_coins()

############################################
# Data Collection and Indicator Calculation (Common)
############################################

def get_upbit_data(market, count=100):
    url = f"https://api.upbit.com/v1/candles/minutes/1?market={market}&count={count}"
    response = requests.get(url)
    data = response.json()
    df = pd.DataFrame(data)
    # 필요한 컬럼 선택 및 역순 정렬
    df = df[['candle_date_time_kst', 'opening_price', 'high_price', 'low_price', 'trade_price', 'candle_acc_trade_volume']]
    df = df[::-1].reset_index(drop=True)
    return df

def calculate_indicators(df):
    df['Price_Change_1'] = df['trade_price'].pct_change(1)
    df['Price_Change_3'] = df['trade_price'].pct_change(3)
    df['3EMA'] = df['trade_price'].ewm(span=3, adjust=False).mean()
    df['6EMA'] = df['trade_price'].ewm(span=6, adjust=False).mean()
    df['10EMA'] = df['trade_price'].ewm(span=10, adjust=False).mean()
    df['MACD'] = df['3EMA'] - df['6EMA']
    df['MACD_Change'] = df['MACD'].diff()
    df['MACD_Change_3'] = df['MACD'].diff(3)
    delta = df['trade_price'].diff()
    gain = np.where(delta > 0, delta, 0)
    loss = np.where(delta < 0, -delta, 0)
    avg_gain = pd.Series(gain).rolling(window=3).mean()
    avg_loss = pd.Series(loss).rolling(window=3).mean()
    rs = avg_gain / avg_loss
    df['RSI'] = 100 - (100 / (1 + rs))
    df['RSI_Change'] = df['RSI'].diff()
    df['RSI_Change_3'] = df['RSI'].diff(3)
    df['Stochastic'] = ((df['trade_price'] - df['low_price'].rolling(3).min()) /
                        (df['high_price'].rolling(3).max() - df['low_price'].rolling(3).min())) * 100
    df['Rebound_Signal'] = ((df['trade_price'].diff(2) < 0) & (df['trade_price'].diff(1) > 0)).astype(int)
    df['Peak_Signal'] = ((df['trade_price'].diff(2) > 0) & (df['trade_price'].diff(1) < 0)).astype(int)
    df['Strong_Peak_Signal'] = ((df['trade_price'].diff(3) > 0) &
                                (df['trade_price'].diff(2) > 0) &
                                (df['trade_price'].diff(1) < 0)).astype(int)
    df['Sudden_Price_Drop'] = (df['trade_price'].pct_change(1) < -0.01).astype(int)
    df['Failed_10EMA_Breakout'] = (df['trade_price'] < df['10EMA']).astype(int)
    return df.dropna()

############################################
# Prediction Function: For each coin, predict, save CSV, update result
############################################

def predict_and_evaluate_for_coin(coin):
    global latest_prediction
    market = f"KRW-{coin}"
    df_new = get_upbit_data(market)
    df_new = calculate_indicators(df_new)
    df_new.dropna(inplace=True)
    if df_new.empty:
        print(f"❌ [{coin}] 데이터 부족/API 오류")
        return

    models = models_dict.get(coin)
    if models is None:
        print(f"❌ [{coin}] 모델을 찾을 수 없습니다.")
        return

    # Feature 추출 및 스케일링
    X_new_up = df_new[selected_features_up].iloc[-1:]
    X_new_down = df_new[selected_features_down].iloc[-1:]
    X_new_up_scaled = models["scaler_up"].transform(X_new_up)
    X_new_down_scaled = models["scaler_down"].transform(X_new_down)

    xgb_up_prob = models["xgb_up"].predict_proba(X_new_up_scaled)[0][1] * 100
    xgb_down_prob = models["xgb_down"].predict_proba(X_new_down_scaled)[0][1] * 100
    prob_sum = xgb_up_prob + xgb_down_prob
    xgb_up_prob = round((xgb_up_prob / prob_sum) * 100)
    xgb_down_prob = 100 - xgb_up_prob

    predicted_direction = "상승 📈" if xgb_up_prob > xgb_down_prob else "하락 📉"
    current_price = df_new['trade_price'].iloc[-1]
    prediction_time = df_new['candle_date_time_kst'].iloc[-1]

    print(f"\n✅ [{coin}] 예측 결과")
    print(f"📅 예측 시간: {prediction_time}")
    print(f"💰 현재 가격: {current_price}")
    print(f"📢 최종 예측: {predicted_direction} (상승 {xgb_up_prob}%, 하락 {xgb_down_prob}%)")

    # 중간 결과 업데이트 (메모리만 업데이트)
    latest_prediction[coin] = {
        "prediction_time": prediction_time,
        "current_price": current_price,
        "predicted_dir": predicted_direction,
        "xgb_up_prob": xgb_up_prob,
        "xgb_down_prob": xgb_down_prob,
        "future_time": None,
        "future_price": None,
        "actual_dir": None,
        "result": None
    }

    # 5분 대기 후 실제 가격 확인 및 최종 결과 업데이트
    print(f"\n⌛ [{coin}] 5분 후 실제 가격 확인 대기...")
    time.sleep(300)
    df_future = get_upbit_data(market)
    future_price = df_future['trade_price'].iloc[-1]
    future_time = df_future['candle_date_time_kst'].iloc[-1]
    actual_direction = "상승 📈" if future_price > current_price else ("하락 📉" if future_price < current_price else "변동없음")
    result = "⭕ 정답" if predicted_direction == actual_direction else "❌ 오답"
    print(f"\n✅ [{coin}] 예측 검증 결과")
    print(f"📅 실제 확인 시간: {future_time}")
    print(f"💰 5분 후 실제 가격: {future_price}")
    print(f"📢 예측 결과: {predicted_direction} → {result}")

    latest_prediction[coin].update({
        "future_time": future_time,
        "future_price": future_price,
        "actual_dir": actual_direction,
        "result": result
    })

    # 최종 결과만 CSV에 저장
    csv_file = f"prediction_results_{coin}.csv"
    row_data = df_new.iloc[-1][ALL_FEATURES].to_dict()
    row_data.update({
        "prediction_time": prediction_time,
        "current_price": current_price,
        "future_time": future_time,
        "future_price": future_price,
        "predicted_dir": predicted_direction,
        "actual_dir": actual_direction,
        "xgb_up_prob": xgb_up_prob,
        "xgb_down_prob": xgb_down_prob,
        "result": result
    })
    df_to_save = pd.DataFrame([row_data])
    is_file_exist = os.path.isfile(csv_file)
    df_to_save.to_csv(csv_file, mode='a', header=not is_file_exist, index=False)
    print(f"✅ [{coin}] 최종 CSV 저장 완료: {csv_file}")


############################################
# Retraining Function: Retrain model using coin-specific CSV file
############################################

def retrain_model_for_coin(coin):
    models = models_dict.get(coin)
    csv_file = f"prediction_results_{coin}.csv"
    if not os.path.exists(csv_file):
        print(f"❌ [{coin}] 재학습 불가: CSV 파일이 없습니다.")
        return

    df = pd.read_csv(csv_file)
    # Create labels: 1 if future_price > current_price, else 0
    df['label_up'] = (df['future_price'] > df['current_price']).astype(int)
    df['label_down'] = (df['future_price'] < df['current_price']).astype(int)

    X_up = df[selected_features_up].copy()
    y_up = df['label_up'].copy()
    X_down = df[selected_features_down].copy()
    y_down = df['label_down'].copy()

    X_up = X_up.dropna()
    y_up = y_up.loc[X_up.index]
    X_down = X_down.dropna()
    y_down = y_down.loc[X_down.index]

    if len(X_up) < 10 or len(X_down) < 10:
        print(f"❌ [{coin}] 데이터 부족: 재학습이 유의미하지 않습니다.")
        return

    new_scaler_up = StandardScaler()
    X_up_scaled = new_scaler_up.fit_transform(X_up)
    new_scaler_down = StandardScaler()
    X_down_scaled = new_scaler_down.fit_transform(X_down)

    new_xgb_up = XGBClassifier(n_estimators=500, learning_rate=0.05, max_depth=5, random_state=42)
    new_xgb_up.fit(X_up_scaled, y_up)
    new_xgb_down = XGBClassifier(n_estimators=500, learning_rate=0.05, max_depth=5, random_state=42)
    new_xgb_down.fit(X_down_scaled, y_down)

    # Overwrite model files
    joblib.dump(new_xgb_up, f"xgb_up_{coin}.pkl")
    joblib.dump(new_scaler_up, f"scaler_up_{coin}.pkl")
    joblib.dump(new_xgb_down, f"xgb_down_{coin}.pkl")
    joblib.dump(new_scaler_down, f"scaler_down_{coin}.pkl")

    # Update in-memory models
    models_dict[coin]["xgb_up"] = new_xgb_up
    models_dict[coin]["scaler_up"] = new_scaler_up
    models_dict[coin]["xgb_down"] = new_xgb_down
    models_dict[coin]["scaler_down"] = new_scaler_down
    print(f"✅ [{coin}] 재학습 완료 및 모델 업데이트")

############################################
# Run prediction loop for each coin (Multi-threading)
############################################

def run_forever_for_coin(coin):
    i = 1
    while True:
        try:
            print(f"\n⏳ [{coin}] {i}번째 예측 실행 중...")
            predict_and_evaluate_for_coin(coin)
            # Retrain every 288 predictions (approximately 24 hours)
            if i % 12 == 0:
                print(f"\n🚀 [{coin}] 288회 예측 완료 - 재학습 진행!")
                retrain_model_for_coin(coin)
            i += 1
        except Exception as e:
            print(f"❌ [{coin}] 에러 발생: {e}")
            time.sleep(10)

############################################
# Flask API Section
############################################

app = Flask(__name__)
CORS(app)

@app.route("/api/prediction_result")
def prediction_result():
    # Get coin symbol from market parameter (e.g., "KRW-BTC" -> "BTC")
    market = request.args.get("market", "KRW-BTC")
    coin = market.split("-")[-1]
    if coin not in latest_prediction or latest_prediction[coin] is None:
        return jsonify({"error": f"No prediction result available for {coin}"}), 404
    return jsonify(latest_prediction[coin])

@app.route("/api/coin_trend")
def coin_trend():
    market = request.args.get("market", "KRW-BTC")
    coin = market.split("-")[-1]
    if coin not in latest_prediction or latest_prediction[coin] is None:
        return jsonify({"up_prob": 50, "down_prob": 50})
    return jsonify({
        "up_prob": latest_prediction[coin].get("xgb_up_prob", 50),
        "down_prob": latest_prediction[coin].get("xgb_down_prob", 50)
    })

@app.route("/api/bitcoin_data")
def bitcoin_data():
    type_param = request.args.get("type", "5min")
    market = request.args.get("market", "KRW-BTC")
    if type_param == "5min":
        url = "https://api.upbit.com/v1/candles/minutes/5"
    elif type_param == "daily":
        url = "https://api.upbit.com/v1/candles/days"
    else:
        return jsonify({"error": "Invalid type parameter. Use '5min' or 'daily'."}), 400

    count = request.args.get("count", 200)
    try:
        count = int(count)
    except ValueError:
        count = 200

    params = {"market": market, "count": count}
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return jsonify({"error": "Failed to retrieve data from Upbit API"}), 500

    data = response.json()
    data.reverse()

    # Calculate indicators: RSI, MACD, Signal
    prices = [item["trade_price"] for item in data]
    rsi_values = compute_rsi(prices, period=14)
    macd_values, signal_values = compute_macd(prices, short_period=12, long_period=26, signal_period=9)

    transformed_data = []
    for idx, item in enumerate(data):
        transformed_data.append({
            "date": item["candle_date_time_kst"],
            "open": item["opening_price"],
            "high": item["high_price"],
            "low": item["low_price"],
            "close": item["trade_price"],
            "candle_acc_trade_volume": item["candle_acc_trade_volume"],
            "rsi": rsi_values[idx] if idx < len(rsi_values) else None,
            "macd": macd_values[idx] if idx < len(macd_values) else None,
            "signal": signal_values[idx] if idx < len(signal_values) else None
        })

    return jsonify(transformed_data)

############################################
# Main Execution: Start prediction threads for each coin and run Flask server
############################################

if __name__ == "__main__":
    # Start a thread for each coin's prediction loop
    for coin in coins_list:
        thread = threading.Thread(target=run_forever_for_coin, args=(coin,), daemon=True)
        thread.start()
    # Run Flask API server
    app.run(debug=True, use_reloader=False)
