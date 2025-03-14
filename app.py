import threading
import time
import os
import pandas as pd
import numpy as np
import joblib
import requests
import pymysql
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler
from flask import Flask, request, jsonify
from flask_cors import CORS

############################################
# 1) DB 연결 설정
############################################

def get_db_connection():
    return pymysql.connect(
        host='project-db-cgi.smhrd.com',
        port=3307,
        user='cgi_24K_AI4_p2_2',
        password='smhrd2',
        db='cgi_24K_AI4_p2_2',
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )

def get_training_data_from_db(coin):
    conn = get_db_connection()  # 새 연결 생성
    table_name = f"prediction_results_{coin}"
    sql = f"SELECT * FROM {table_name}"
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
            rows = cursor.fetchall()
    finally:
        conn.close()  # 연결 닫기
    df = pd.DataFrame(rows)
    return df



############################################
# 2) 유틸 함수: EMA, RSI, MACD
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
# 3) 전역 설정
############################################

coins_list = ["BTC", "ETH", "BCH", "SOL", "NEO", "TRUMP", "STRIKE", "ENS", "ETC", "XRP"]
latest_prediction = {}    # 예: latest_prediction["BTC"] = {...}
models_dict = {}

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
# 4) 모델 로드
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
# 5) 데이터 수집 & 지표 계산
############################################

def get_upbit_data(market, count=100):
    url = f"https://api.upbit.com/v1/candles/minutes/1?market={market}&count={count}"
    response = requests.get(url)
    data = response.json()
    df = pd.DataFrame(data)
    df = df[['candle_date_time_kst','opening_price','high_price','low_price','trade_price','candle_acc_trade_volume']]
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
# 6) DB Insert / Select 함수
############################################

def insert_prediction_result(coin, row_data):
    conn = get_db_connection()  # 새 연결 생성
    table_name = f"prediction_results_{coin}"
    columns = ", ".join(row_data.keys())
    placeholders = ", ".join(["%s"] * len(row_data))
    sql = f"INSERT INTO {table_name} ({columns}) VALUES ({placeholders})"
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, tuple(row_data.values()))
        conn.commit()
    finally:
        conn.close()

def get_training_data_from_db(coin):
    conn = get_db_connection()  # 새 연결 생성
    table_name = f"prediction_results_{coin}"
    sql = f"SELECT * FROM {table_name}"
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql)
            rows = cursor.fetchall()
    finally:
        conn.close()  # 연결 닫기
    # rows가 리스트가 아닐 경우 리스트로 감싸기
    if not isinstance(rows, list):
        rows = [rows]
    df = pd.DataFrame(rows)
    return df


############################################
# 7) 즉시 예측 함수 (평가 없이 최신 데이터로 예측 및 DB 저장)
############################################

def predict_immediate_for_coin(coin):
    global latest_prediction
    market = f"KRW-{coin}"
    df_new = get_upbit_data(market)
    df_new = calculate_indicators(df_new)
    print(f"[{coin}] (즉시) df_new columns:", df_new.columns.tolist())
    df_new = df_new.dropna()
    if df_new.empty:
        raise Exception(f"[{coin}] 데이터 부족/API 오류")

    models = models_dict.get(coin)
    if models is None:
        raise Exception(f"[{coin}] 모델을 찾을 수 없습니다.")

    X_new_up = df_new[selected_features_up].iloc[-1:]
    X_new_down = df_new[selected_features_down].iloc[-1:]
    X_new_up_scaled = models["scaler_up"].transform(X_new_up)
    X_new_down_scaled = models["scaler_down"].transform(X_new_down)

    xgb_up_prob = models["xgb_up"].predict_proba(X_new_up_scaled)[0][1] * 100
    xgb_down_prob = models["xgb_down"].predict_proba(X_new_down_scaled)[0][1] * 100
    prob_sum = xgb_up_prob + xgb_down_prob
    xgb_up_prob = round((xgb_up_prob / prob_sum) * 100)
    xgb_down_prob = 100 - xgb_up_prob

    predicted_direction = "상승 " if xgb_up_prob > xgb_down_prob else "하락 "
    current_price = df_new['trade_price'].iloc[-1]
    prediction_time = df_new['candle_date_time_kst'].iloc[-1]

    print(f"\n [{coin}] (즉시) 예측 결과")
    print(f" 예측 시간: {prediction_time}")
    print(f" 현재 가격: {current_price}")
    print(f" 최종 예측: {predicted_direction} (상승 {xgb_up_prob}%, 하락 {xgb_down_prob}%)")

    latest_prediction[coin] = {
        "prediction_time": prediction_time,
        "current_price": current_price,
        "predicted_dir": predicted_direction,
        "xgb_up_prob": xgb_up_prob,
        "xgb_down_prob": xgb_down_prob,
        "future_time": prediction_time,  # 또는 "" 혹은 "N/A"
        "future_price": 0,
        "actual_dir": 0,
        "result": 0
    }
    
    # 만약 DB 저장도 원하신다면, 여기에 DB 저장 함수를 호출하세요.
    try:
        insert_prediction_result(coin, latest_prediction[coin])
        print(f"[{coin}] 예측 결과 DB 저장 완료!")
    except Exception as db_e:
        print(f"[{coin}] DB 저장 실패: {db_e}")
        
    return latest_prediction[coin]




############################################
# 8) 재학습 함수
############################################

def retrain_model_for_coin(coin):
    models = models_dict.get(coin)
    if models is None:
        print(f" [{coin}] 모델이 없습니다.")
        return

    df = get_training_data_from_db(coin)
    if df.empty:
        print(f" [{coin}] 재학습 불가: DB에 데이터가 없습니다.")
        return

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
        print(f" [{coin}] 재학습 불가: 데이터가 너무 적습니다.")
        return

    new_scaler_up = StandardScaler()
    X_up_scaled = new_scaler_up.fit_transform(X_up)
    new_scaler_down = StandardScaler()
    X_down_scaled = new_scaler_down.fit_transform(X_down)

    new_xgb_up = XGBClassifier(n_estimators=500, learning_rate=0.05, max_depth=5, random_state=42)
    new_xgb_up.fit(X_up_scaled, y_up)
    new_xgb_down = XGBClassifier(n_estimators=500, learning_rate=0.05, max_depth=5, random_state=42)
    new_xgb_down.fit(X_down_scaled, y_down)

    joblib.dump(new_xgb_up, f"xgb_up_{coin}.pkl")
    joblib.dump(new_scaler_up, f"scaler_up_{coin}.pkl")
    joblib.dump(new_xgb_down, f"xgb_down_{coin}.pkl")
    joblib.dump(new_scaler_down, f"scaler_down_{coin}.pkl")

    models_dict[coin]["xgb_up"] = new_xgb_up
    models_dict[coin]["scaler_up"] = new_scaler_up
    models_dict[coin]["xgb_down"] = new_xgb_down
    models_dict[coin]["scaler_down"] = new_scaler_down
    print(f"✅ [{coin}] 재학습 완료 및 모델 업데이트")

############################################
# 9) 예측 루프 실행 함수 (멀티스레딩)
############################################

def run_forever_for_coin(coin):
    i = 1
    while True:
        try:
            print(f"\n [{coin}] {i}번째 예측 실행 중...")
            predict_immediate_for_coin(coin)  # 즉시 예측 함수 호출
            if i % 288 == 0:
                print(f"\n [{coin}] 288회 예측 완료 - 재학습 진행!")
                retrain_model_for_coin(coin)
            i += 1
            time.sleep(60)  # 1분 간격으로 예측 실행 (원하는 주기로 조정)
        except Exception as e:
            print(f" [{coin}] 에러 발생: {e}")
            time.sleep(10)

############################################
# 10) Flask API
############################################

app = Flask(__name__)
CORS(app)

@app.route("/api/prediction_result")
def prediction_result():
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

@app.route("/api/update_prediction")
def update_prediction():
    market = request.args.get("market", "KRW-BTC")
    coin = market.split("-")[-1]
    try:
        result = predict_immediate_for_coin(coin)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

############################################
# 11) 메인 실행
############################################

if __name__ == "__main__":
    for coin in coins_list:
        thread = threading.Thread(target=run_forever_for_coin, args=(coin,), daemon=True)
        thread.start()
    app.run(debug=True, use_reloader=False)
