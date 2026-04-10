require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var webpush = require("web-push");

webpush.setVapidDetails(
  "mailto:romainauthier@outlook.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

var usersRouter = require("./routes/users");
const surprisesRouter = require("./routes/surprises");

var app = express();
require("./models/connection");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.use("/users", usersRouter);
app.use("/surprises", surprisesRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});

module.exports = app;
