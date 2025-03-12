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

# 전역 변수: 최신 예측 결과를 저장 (API에서 사용)
latest_prediction = None

############################################
# 1) 실시간 예측 관련 함수 및 설정
############################################

def get_upbit_data(market="KRW-XRP", count=100):
    url = f"https://api.upbit.com/v1/candles/minutes/1?market={market}&count={count}"
    response = requests.get(url)
    data = response.json()
    df = pd.DataFrame(data)
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

# 기존 모델 및 스케일러 파일 로드 (해당 파일들이 존재해야 함)
scaler_up = joblib.load("scaler_up_XRP.pkl")
scaler_down = joblib.load("scaler_down_XRP.pkl")
xgb_up = joblib.load("xgb_up_XRP.pkl")
xgb_down = joblib.load("xgb_down_XRP.pkl")

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

def predict_and_evaluate():
    global xgb_up, xgb_down, scaler_up, scaler_down, latest_prediction

    # 최신 데이터 수집 및 지표 계산
    df_new = get_upbit_data()
    df_new = calculate_indicators(df_new)
    df_new.dropna(inplace=True)
    if df_new.empty:
        print("❌ [ERROR] 데이터 부족/API 오류, 재시도 중...")
        return

    # 현재 시점 Feature 추출 및 스케일링
    X_new_up = df_new[selected_features_up].iloc[-1:]
    X_new_down = df_new[selected_features_down].iloc[-1:]
    X_new_up_scaled = scaler_up.transform(X_new_up)
    X_new_down_scaled = scaler_down.transform(X_new_down)

    # 상승/하락 확률 예측
    xgb_up_prob = xgb_up.predict_proba(X_new_up_scaled)[0][1] * 100
    xgb_down_prob = xgb_down.predict_proba(X_new_down_scaled)[0][1] * 100
    prob_sum = xgb_up_prob + xgb_down_prob
    xgb_up_prob = round((xgb_up_prob / prob_sum) * 100)
    xgb_down_prob = 100 - xgb_up_prob

    predicted_direction = "상승 📈" if xgb_up_prob > xgb_down_prob else "하락 📉"
    current_price = df_new['trade_price'].iloc[-1]
    prediction_time = df_new['candle_date_time_kst'].iloc[-1]

    print("\n✅ [예측 결과]")
    print(f"📅 예측 시간: {prediction_time}")
    print(f"💰 현재 가격: {current_price}")
    print(f"📢 최종 예측: {predicted_direction} (상승 확률: {xgb_up_prob}%, 하락 확률: {xgb_down_prob}%)")

    # **중간 결과를 즉시 최신 예측 결과로 업데이트**
    latest_prediction = {
        "prediction_time": prediction_time,
        "current_price": current_price,
        "predicted_dir": predicted_direction,
        "xgb_up_prob": xgb_up_prob,
        "xgb_down_prob": xgb_down_prob,
        # 아직 5분 후 결과는 없으므로 기본값 또는 None 사용
        "future_time": None,
        "future_price": None,
        "actual_dir": None,
        "result": None
    }

    # 5분 대기 후 실제 가격 확인
    print("\n⌛ 5분 후 실제 가격 확인을 위해 대기 중...\n")
    time.sleep(300)

    df_future = get_upbit_data()
    future_price = df_future['trade_price'].iloc[-1]
    future_time = df_future['candle_date_time_kst'].iloc[-1]
    actual_direction = "상승 📈" if future_price > current_price else ("하락 📉" if future_price < current_price else "변동없음")
    result = "⭕ 정답" if predicted_direction == actual_direction else "❌ 오답"

    print("\n✅ [예측 검증 결과]")
    print(f"📅 실제 확인 시간: {future_time}")
    print(f"💰 5분 후 실제 가격: {future_price}")
    print(f"📢 예측 결과: {predicted_direction} → {result}")

    # CSV 저장 (파일에 누적 기록)
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
    csv_file = "prediction_results.csv"
    is_file_exist = os.path.isfile(csv_file)
    df_to_save.to_csv(csv_file, mode='a', header=not is_file_exist, index=False)
    print("✅ CSV 저장 완료:", csv_file)

    # 최종 결과로 전역 변수 업데이트
    latest_prediction = row_data


def retrain_model():
    global xgb_up, xgb_down, scaler_up, scaler_down

    csv_file_path = "prediction_results.csv"
    if not os.path.exists(csv_file_path):
        print("❌ [ERROR] 재학습 불가: CSV 파일이 없습니다.")
        return

    df = pd.read_csv(csv_file_path)
    df['label_up'] = (df['future_price'] > df['current_price']).astype(int)
    df['label_down'] = (df['future_price'] < df['current_price']).astype(int)

    selected_features_up = [
        'Price_Change_1','Price_Change_3','MACD_Change','RSI_Change','RSI_Change_3',
        'Stochastic','Rebound_Signal','Peak_Signal','3EMA','10EMA','MACD'
    ]
    selected_features_down = [
        'Price_Change_1','MACD_Change','MACD_Change_3','RSI_Change','Strong_Peak_Signal',
        'Sudden_Price_Drop','Failed_10EMA_Breakout','6EMA','Stochastic'
    ]

    X_up = df[selected_features_up].copy()
    y_up = df['label_up'].copy()
    X_down = df[selected_features_down].copy()
    y_down = df['label_down'].copy()

    X_up = X_up.dropna()
    y_up = y_up.loc[X_up.index]
    X_down = X_down.dropna()
    y_down = y_down.loc[X_down.index]

    if len(X_up) < 10 or len(X_down) < 10:
        print("❌ [WARNING] 데이터가 너무 적어 재학습이 유의미하지 않습니다.")
        return

    new_scaler_up = StandardScaler()
    X_up_scaled = new_scaler_up.fit_transform(X_up)
    new_scaler_down = StandardScaler()
    X_down_scaled = new_scaler_down.fit_transform(X_down)

    new_xgb_up = XGBClassifier(n_estimators=500, learning_rate=0.05, max_depth=5, random_state=42)
    new_xgb_up.fit(X_up_scaled, y_up)
    new_xgb_down = XGBClassifier(n_estimators=500, learning_rate=0.05, max_depth=5, random_state=42)
    new_xgb_down.fit(X_down_scaled, y_down)

    joblib.dump(new_xgb_up, "xgb_up_XRP.pkl")
    joblib.dump(new_scaler_up, "scaler_up_XRP.pkl")
    joblib.dump(new_xgb_down, "xgb_down_XRP.pkl")
    joblib.dump(new_scaler_down, "scaler_down_XRP.pkl")

    print("✅ 재학습 완료! 새 모델 & 스케일러 파일을 저장했습니다.")
    xgb_up = new_xgb_up
    xgb_down = new_xgb_down
    scaler_up = new_scaler_up
    scaler_down = new_scaler_down
    print("✅ 메모리 모델도 새 버전으로 업데이트 완료!")

def run_forever():
    i = 1
    while True:
        try:
            print(f"\n⏳ [{i}] 번째 예측 실행 중...")
            predict_and_evaluate()
            if i % 288 == 0:
                print("\n🚀 [재학습 시도] 288회 예측 완료 - 재학습 진행!")
                retrain_model()
            i += 1
        except Exception as e:
            print(f"❌ 에러 발생: {e}")
            time.sleep(10)

############################################
# 2) Flask API 관련 코드
############################################

app = Flask(__name__)
CORS(app)

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

@app.route("/api/bitcoin_data")
def bitcoin_data():
    type_param = request.args.get("type", "5min")
    market = request.args.get("market", "KRW-XRP")
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
            "price": item["trade_price"],
            "rsi": rsi_values[idx] if idx < len(rsi_values) else None,
            "macd": macd_values[idx] if idx < len(macd_values) else None,
            "signal": signal_values[idx] if idx < len(signal_values) else None
        })

    return jsonify(transformed_data)

@app.route("/api/prediction_result")
def prediction_result():
    if latest_prediction is None:
        return jsonify({"error": "No prediction result available"}), 404
    return jsonify(latest_prediction)

@app.route("/api/coin_trend")
def coin_trend():
    market = request.args.get("market", "KRW-XRP")
    # XRP 예측 결과만 제공 (예측 모델은 XRP 전용)
    if market != "KRW-XRP":
        return jsonify({"up_prob": 50, "down_prob": 50})
    if latest_prediction is None:
        return jsonify({"up_prob": 50, "down_prob": 50})
    return jsonify({
        "up_prob": latest_prediction.get("xgb_up_prob", 50),
        "down_prob": latest_prediction.get("xgb_down_prob", 50)
    })


############################################
# 3) 메인 실행: 멀티스레딩으로 두 기능 실행
############################################

if __name__ == "__main__":
    # 실시간 예측 작업을 백그라운드 스레드로 실행
    prediction_thread = threading.Thread(target=run_forever, daemon=True)
    prediction_thread.start()

    # 메인 스레드에서 Flask API 서버 실행
    app.run(debug=True, use_reloader=False)
