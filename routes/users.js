var express = require("express");
var router = express.Router();
require("../models/connection");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

// GET tous les users
router.get("/all", async (req, res) => {
  try {
    const allUsers = await User.find();

    if (allUsers.length > 0) {
      res.status(200).json({ result: true, allUsers });
    } else {
      res.status(404).json({ result: false, message: "Pas d'utilisateur.ice" });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// POST inscription
router.post("/signup", async (req, res) => {
  try {
    if (!checkBody(req.body, ["password", "status", "name"])) {
      res.status(400).json({ result: false, message: "Champs manquants" });
      return;
    }

    const { name, password, status } = req.body;

    const result = await User.findOne({ name: name.toLowerCase() });
    if (!result) {
      const hash = bcrypt.hashSync(password, 10);

      const newUser = new User({
        name: name.toLowerCase(),
        password: hash,
        token: uid2(32),
        status: status,
      });

      const savedUser = await newUser.save();
      res.status(201).json({
        result: true,
        savedUser,
        message: "Utilisateur.ice enregistré.e !",
      });
    } else {
      res
        .status(400)
        .json({ result: false, message: "Utilisateur.ice déjà existant.e !" });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// POST connexion
router.post("/signin", async (req, res) => {
  try {
    if (!checkBody(req.body, ["name", "password"])) {
      res.status(400).json({ result: false, message: "Champs manquants" });
      return;
    }

    const { name, password } = req.body;

    const foundUser = await User.findOne({ name: name.toLowerCase() });

    if (foundUser && bcrypt.compareSync(password, foundUser.password)) {
      res.status(302).json({
        result: true,
        foundUser,
      });
    } else {
      res.status(401).json({
        result: false,
        message: "Nous n'avons pas pu vous identifier.",
      });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

module.exports = router;
