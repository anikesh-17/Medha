const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// ! Require all the routes here
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

// ? Using all the routes here
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

// Check
app.get("/", (req, res) => {
  res.send("Medha API running");
});

module.exports = app;
