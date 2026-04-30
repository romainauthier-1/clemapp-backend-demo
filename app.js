require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var webpush = require("web-push");
const mongoose = require("mongoose");

webpush.setVapidDetails(
  "mailto:romainauthier@outlook.com",
  process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.EXPO_PUBLIC_VAPID_PRIVATE_KEY,
);

var usersRouter = require("./routes/users");
const surprisesRouter = require("./routes/surprises");
const notifRouter = require("./routes/notifications");

var app = express();
require("./models/connection");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/users", usersRouter);
app.use("/surprises", surprisesRouter);
app.use("/notifications", notifRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
app.get("/health", async (req, res) => {
  const state = mongoose.connection.readyState;
  // 0 = déconnecté, 1 = connecté, 2 = connecting, 3 = disconnecting
  const states = ["déconnecté", "connecté", "en cours...", "fermeture..."];

  try {
    await mongoose.connection.db.admin().ping();
    res.json({ db: "connecté ✅", ping: "OK" });
  } catch (err) {
    res
      .status(503)
      .json({ db: states[state], ping: "KO ❌", error: err.message });
  }
});
module.exports = app;
