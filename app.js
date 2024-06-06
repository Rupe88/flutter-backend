const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const { connectionDB } = require("./config/connection");
const errorMiddleware = require("./middlewares/errorMiddleware");
const authRoutes = require("./routes/userRoute");
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "hello world",
    success: true,
  });
});

app.use("/auth", authRoutes);

app.all("*", (req, res, next) => {
  const err = new Error(`Cannot find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  err.status = "fail";
  next(err);
});
//handler middleware
app.use(errorMiddleware);
// listening
app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
  connectionDB();
});
