require("express-async-errors");
const winston = require("winston");
const express = require("express");
const app = express();
const err = require("./middleware/err");
const routehandler = require("./routes");
const bodyParser = require("body-parser");
global.__basedir = __dirname;
const setConfig = require("./middleware/setConfig");

const PORT = 30007;

const fileTransport = new winston.transports.File({
  filename: "error.log",
  level: "error",
});

const consoleTransport = new winston.transports.Console();
const uncaughtExceptionTransport = new winston.transports.File({
  filename: "uncaughtException.log",
});
const logFileTransport = new winston.transports.File({
  filename: "logfile.log",
});
// Add mysqlTransport if needed

const logger = winston.createLogger({
  transports: [
    consoleTransport,
    fileTransport,
    uncaughtExceptionTransport,
    logFileTransport,
  ],
});

app
  .listen(PORT, () => console.log(`express is running on ${PORT}`))
  .on("error", function (err) {
    console.log(err);
  });

// Unhandled exceptions and rejections
process.on("uncaughtException", (error) => {
  logger.error(error.message, error);
  process.exit(1);
});

winston.exceptions.handle([
  new winston.transports.Console(),
  new winston.transports.File({ filename: "uncaughtException.log" }),
]);

/* Route middlewares */
const allowedOrigins = [
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://localhost:3000",
  "http://localhost:3002",
  `${process.env.BASE_URL}`,
];

/* Cors Setup */
const cors = require("cors");
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

const dataLimit = "70mb";

app.use(
  express.json({
    limit: dataLimit,
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.use(express.urlencoded({ extended: true, limit: dataLimit }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/back", setConfig, routehandler);
app.use(err);
