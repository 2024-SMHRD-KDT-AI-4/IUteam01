// 디비의 연결정보를 관리하고 실제 연결을 담당하는 파일
const mysql = require("mysql2")

// connection
// DB연결 정보 넣어주기
const conn = mysql.createConnection({
    host : "project-db-cgi.smhrd.com",
    port : 3307,
    user : "cgi_24K_AI4_p2_2",
    password : "smhrd2",
    database : "cgi_24K_AI4_p2_2"
})

// DB연결 실행하기
conn.connect();
console.log("DB연결 성공")

module.exports = conn;