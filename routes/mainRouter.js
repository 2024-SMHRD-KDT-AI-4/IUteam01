const express = require("express")
const router = express.Router();
const path = require("path")
const publicPath = path.join(__dirname,"../public/")
const conn = require("../config/db");

router.post("/login",(req,res)=>{
    let {id,pw} = req.body;
    console.log(id,pw);
    let sql = "select * from USER_INFO where USER_ID = ? and USER_PW = ?"
    conn.query(sql, [id,pw],(err,result)=>{
        console.log("실행결과 : ", result)
        console.log(result[0].USER_NICK)
        // select문은 리턴결과가 리스트 형태로 반환 > 데이터가 있으면 리스트의 길이가 0보다 크다
        if(result.length > 0){
            data={
                result:"로그인 성공",
                nick : result[0].USER_NICK
            }
            res.send(data)
        }else{
            res.send("로그인 실패")
        }
    })
})

router.post("/signup", (req, res) => {
    let { id, pw, name, gd, bd, nick, role, at } = req.body;

    console.log('test');
    console.log(id, pw, name, gd, bd, nick, role, at);

    // 아이디 중복 확인 쿼리
    let checkIdSql = "SELECT * FROM USER_INFO WHERE USER_ID = ?";
    conn.query(checkIdSql, [id], (err, result) => {
        if (err) {
            console.log("중복 체크 오류: ", err);
            return res.send("중복체크");
        }

        // 아이디가 이미 존재하면 회원가입 거부
        if (result.length > 0) {
            return res.send("중복발생"); // 또는 중복된 아이디 알림 페이지로 리디렉션
        }

        // 아이디가 중복되지 않으면 회원가입 진행
        let sql = "INSERT INTO USER_INFO(USER_ID, USER_PW, USER_NAME, USER_GENDER, USER_BIRTHDATE, USER_NICK, USER_ROLE, JOIND_AT) VALUES(?,?,?,?,?,?,?,?)";
        conn.query(sql, [id, pw, name, gd, bd, nick, role, at], (err, result) => {
            if (err) {
                console.log("회원가입 오류: ", err);
                return res.send("실패"); // 회원가입 오류가 발생하면 다시 가입 페이지로 리디렉션
            }

            console.log("실행결과 : ", result);
            if (result.affectedRows > 0) {
                res.send("회원가입 성공"); // 회원가입 성공 시 메인 페이지로 이동
            } else {
                res.send("회원가입 실패"); // 회원가입 실패 시 다시 가입 페이지로 이동
            }
        });
    });
});

module.exports = router;

