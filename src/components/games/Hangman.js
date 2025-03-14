// Hangman.js
import React, { useState, useEffect } from "react";
import { Button, Grid, Typography, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
// import "./Hangman.css"; // 필요 시 추가 스타일

const useStyles = makeStyles({
  hangmanContainer: {
    textAlign: "center",
    padding: "2rem",
    marginTop: "2rem",
    whiteSpace: "pre-wrap", // 줄바꿈 유지
  },
  wordDisplay: {
    letterSpacing: "0.5rem",
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  letterButton: {
    margin: "0.25rem",
  },
  keyboardContainer: {
    marginTop: "1rem",
  },
});

function Hangman() {
  const classes = useStyles();
  const words = ["APPLE", "BANANA", "ORANGE", "MANGO", "CHERRY", "PINEAPPLE"];
  const [answer, setAnswer] = useState(() => words[Math.floor(Math.random() * words.length)]);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongCount, setWrongCount] = useState(0);
  const maxWrong = 6;

  // ASCII 행맨 그림을 반환하는 함수
  const hangmanDrawing = () => {
    const stages = [
      ` 
  +---+
  |   |
      |
      |
      |
      |
=========`,

      ` 
  +---+
  |   |
  O   |
      |
      |
      |
=========`,

      ` 
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,

      ` 
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,

      ` 
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,

      ` 
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,

      ` 
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========` 
    ];
    return stages[wrongCount];
  };

  // 알파벳 추측 처리
  const handleGuess = (letter) => {
    if (guessedLetters.includes(letter)) return;
    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);
    if (!answer.includes(letter)) {
      setWrongCount((prev) => prev + 1);
    }
  };

  // 정답 단어 표시: 맞춘 글자는 보여주고, 나머지는 "_" 처리
  const renderWord = () => {
    return answer
      .split("")
      .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
      .join(" ");
  };

  const isGameWon = answer.split("").every((letter) => guessedLetters.includes(letter));
  const isGameLost = wrongCount >= maxWrong;

  const resetGame = () => {
    const newAnswer = words[Math.floor(Math.random() * words.length)];
    setAnswer(newAnswer);
    setGuessedLetters([]);
    setWrongCount(0);
  };

  // 키보드 입력 지원
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        handleGuess(key);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [guessedLetters, answer]);

  return (
    <Paper elevation={3} className={classes.hangmanContainer}>
      <Typography variant="h4" gutterBottom>
        Hangman 게임
      </Typography>
      {/* ASCII 행맨 그림 출력 */}
      <pre style={{ fontSize: "1.2rem", margin: "1rem 0" }}>
        {hangmanDrawing()}
      </pre>
      <Typography variant="h5" className={classes.wordDisplay}>
        {renderWord()}
      </Typography>
      <Typography variant="body1">
        남은 기회: {maxWrong - wrongCount}
      </Typography>
      <Grid container justifyContent="center" spacing={1} className={classes.keyboardContainer}>
        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
          <Grid item key={letter}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleGuess(letter)}
              disabled={guessedLetters.includes(letter) || isGameWon || isGameLost}
              className={classes.letterButton}
            >
              {letter}
            </Button>
          </Grid>
        ))}
      </Grid>
      {isGameWon && (
        <Typography variant="h4" color="success.main" gutterBottom>
          축하합니다! 단어를 맞추셨습니다!
        </Typography>
      )}
      {isGameLost && (
        <Typography variant="h4" color="error.main" gutterBottom>
          게임 오버! 정답은 {answer} 였습니다.
        </Typography>
      )}
      {(isGameWon || isGameLost) && (
        <Button variant="outlined" onClick={resetGame} style={{ marginTop: "1rem" }}>
          게임 재시작
        </Button>
      )}
    </Paper>
  );
}

export default Hangman;
