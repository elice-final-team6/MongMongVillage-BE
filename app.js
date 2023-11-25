const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connect = require("./src/db");

dotenv.config();
const userRouter = require("./src/user/router");
const boardRouter = require("./src/board/router");
const commentRouter = require("./src/comment/router");
const cafeRouter = require("./src/cafe/router")
const reviewRouter = require("./src/review/router");

const app = express();
connect();

app.use(
  cors({
    origin: true,
    credentials: false,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/users", userRouter);
app.use("/api/boards", boardRouter);
app.use("/api/comments", commentRouter);
app.use("/api/cafes", cafeRouter);
app.use("/api/reviews", reviewRouter);

app.get("/api", (req, res) => {
  res.send("test");
});

app.get("/", (req, res) => {
  res.send("hi");
});

app.use((req, res, next) => {
  const error = new Error(
    `${req.method} ${req.url} 라우터가 존재하지 않습니다.`
  );
  error.status = 404;
  next(error);
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.send(err.message || "Error!!");
});

app.listen(8000, () => {
  console.log("http://localhost:8000 서버 실행 중");
});
