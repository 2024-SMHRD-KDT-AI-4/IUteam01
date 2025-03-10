const mysql = require("mysql2");

// DB 연결 설정
const dbConfig = {
    host: "project-db-cgi.smhrd.com",
    port: 3307,
    user: "cgi_24K_AI4_p2_2",
    password: "smhrd2",
    database: "cgi_24K_AI4_p2_2",
    waitForConnections: true,
    connectionLimit: 10,  // 동시에 연결 가능한 최대 수
    queueLimit: 0
};

// 연결을 생성하는 함수
function createConnection() {
    const conn = mysql.createConnection(dbConfig);

    // 연결 시도
    conn.connect((err) => {
        if (err) {
            console.error("⚠️ MySQL 연결 실패: ", err);
            setTimeout(createConnection, 5000);  // 5초 후 재연결 시도
        } else {
            console.log("✅ MySQL 연결 성공");
        }
    });

    // 연결이 끊어졌을 때 자동 재연결
    conn.on("error", (err) => {
        console.error("⚠️ MySQL 연결 오류 발생: ", err);
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            console.log("🔄 연결이 끊어졌습니다. 다시 연결을 시도합니다...");
            createConnection();  // 재연결 시도
        } else {
            throw err;
        }
    });

    return conn;
}

// 초기 연결 실행
const connection = createConnection();

module.exports = connection;
