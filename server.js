const express = require("express");
const app = express();
const mainRouter = require("./routes/mainRouter");
const cors = require('cors');

let corsOptions = {
    origin: "*", // 출처 허용 옵션
    credential: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
  };

app.use(cors(corsOptions));
// app에 정적 파일경로 설정
// app.use(express.static(__dirname + "/public"))

// app이라는 서버가 패킷의 body 영역을 사용할 수 있게끔 설정
// 1) post데이터를 처리할 수 있게 등록
app.use(express.urlencoded({extended : false}))

// true : 보안에 문제가 있을 수 있음?
// false : 값만 가져올 때

// 2) 클라이언트가 받아올때

app.use(express.json())
app.use("/",mainRouter);

// app.use("/",()=>{
//     console.log('test')
// });
// app.use("/user",userRouter);


app.listen(3307);