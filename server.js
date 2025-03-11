

const express = require("express");
const app = express();
const path = require("path");
const mainRouter = require("./routes/mainRouter");
const cors = require("cors");

let corsOptions = {
  origin: "*", // 모든 출처 허용
  credential: true,
};

app.use(cors(corsOptions));

// 클라이언트에서 요청 시 POST 데이터와 URL 인코딩 데이터를 사용할 수 있게 설정
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 정적 파일 경로 설정: public 폴더 내의 파일들을 클라이언트에 제공
app.use(express.static(path.join(__dirname, "public")));

app.use("/", mainRouter);

app.listen(3307, () => {
  console.log("서버가 3307 포트에서 실행 중입니다.");
});
