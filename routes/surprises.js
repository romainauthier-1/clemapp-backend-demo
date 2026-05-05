var express = require("express");
var router = express.Router();
require("../models/connection");
const Surprise = require("../models/surprises");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const quotes = require("./femData.json");

// GET toutes les surprises à venir
router.get("/all", async (req, res) => {
  try {
    const allSurprises = await Surprise.find().populate("organizedBy", "name");
    // const futureSurprises = allSurprises?.filter(
    //   (surprise) => surprise.revealAt > new Date(),
    // );

    if (allSurprises.length > 0) {
      res.status(302).json({ result: true, allSurprises });
    } else {
      res
        .status(404)
        .json({ result: false, message: "Aucune surprise trouvée." });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// GET Une citation au hasard
router.get("/random-quote", (req, res) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  res.json({ result: true, quote: quotes[randomIndex] });
});

// POST ajouter une surprise
router.post("/new", async (req, res) => {
  try {
    if (
      !checkBody(req.body, [
        "title",
        "description",
        "organizedBy",
        "revealMode",
        "revealAt",
      ])
    ) {
      res.status(400).json({ result: false, message: "Champs manquants" });
      return;
    }

    const {
      title,
      description,
      type,
      organizedBy,
      revealMode,
      revealAt,
      riddle,
      hint,
      answer,
      notes,
    } = req.body;

    const checkSurprise = await Surprise.findOne({ title });

    if (checkSurprise) {
      res.status(400).json({
        result: false,
        message: "Une surprise avec ce titre existe déjà !",
      });
      return;
    }

    const newSurprise = new Surprise({
      title,
      description,
      type,
      organizedBy,
      revealMode,
      revealAt,
      riddle,
      hint,
      answer,
      isUnlocked: false,
      notes,
    });

    const savedSurprise = await newSurprise.save();
    res.status(201).json({
      result: true,
      savedSurprise,
      message: "Surprise créée avec succès !",
    });
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// GET une surprise by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const foundSurprise = await Surprise.findById(id).populate(
      "organizedBy",
      "name",
    );
    if (foundSurprise) {
      res.status(302).json({ result: true, foundSurprise });
    } else {
      res
        .status(404)
        .json({ result: false, message: "Aucune surprise trouvée." });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// POST débloquer une surprise en répondant à une énigme
router.post("/answer/:id", async (req, res) => {
  try {
    if (!checkBody(req.body, ["answer"])) {
      res
        .status(400)
        .json({ result: false, message: "Aucune réponse fournie !" });
      return;
    }

    const { id } = req.params;

    const foundSurprise = await Surprise.findById(id);

    if (!foundSurprise || foundSurprise.result === false) {
      res
        .status(404)
        .json({ result: false, message: "Surprise non trouvée !" });
      return;
    }

    const { answer } = req.body;

    if (foundSurprise.answer.includes(answer.toLowerCase().trim())) {
      foundSurprise.isUnlocked = true;
      const unlockedSurprise = await foundSurprise.save();
      res.status(200).json({
        result: true,
        unlockedSurprise,
        message: "Bravo ! Surprise débloquée !",
      });
    } else {
      res
        .status(400)
        .json({ result: false, message: "Mauvaise réponse, try again !" });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// POST débloquer une surprise selon la date et l'heure
router.post("/unlock/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const foundSurprise = await Surprise.findById(id);
    const now = new Date();

    if (!foundSurprise) {
      res
        .status(404)
        .json({ result: false, message: "Surprise non trouvée !" });
      return;
    }

    if (foundSurprise.revealMode === "time" && foundSurprise.revealAt <= now) {
      foundSurprise.isUnlocked = true;
      const unlockedSurprise = await foundSurprise.save();
      res.status(200).json({
        result: true,
        unlockedSurprise,
        message: "Surprise débloquée !",
      });
    } else {
      res
        .status(400)
        .json({ result: false, message: "Ce n'est pas encore l'heure !" });
    }
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// POST débloquer une surprise manuellement
router.post("/unlockManually/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const foundSurprise = await Surprise.findById(id);

    if (!foundSurprise) {
      res
        .status(404)
        .json({ result: false, message: "Surprise non trouvée !" });
      return;
    }

    foundSurprise.isUnlocked = true;
    const unlockedSurprise = await foundSurprise.save();
    res.status(200).json({
      result: true,
      unlockedSurprise,
      message: "Surprise débloquée !",
    });
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

//POST Bloquer une surprise manuellement
router.post("/lockManually/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const foundSurprise = await Surprise.findById(id);

    if (!foundSurprise) {
      res
        .status(404)
        .json({ result: false, message: "Surprise non trouvée !" });
      return;
    }

    foundSurprise.isUnlocked = false;
    const lockedSurprise = await foundSurprise.save();
    res.status(200).json({
      result: true,
      lockedSurprise,
      message: "Surprise bloquée !",
    });
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

// GET savoir si la surprise est débloquée
router.get("/isUnlocked/:id", async (req, res) => {
  try {
    const foundSurprise = await Surprise.findById(req.params.id);

    if (foundSurprise && foundSurprise.isUnlocked) {
      res.status(200).json({ result: true, isUnlocked: true });
    } else {
      res.status(200).json({ result: true, isUnlocked: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, message: err.message });
  }
});

// PUT modifier une surprise
router.put("/update/:id", async (req, res) => {
  try {
    if (
      !checkBody(req.body, [
        "title",
        "description",
        "organizedBy",
        "revealMode",
        "revealAt",
      ])
    ) {
      res.status(400).json({ result: false, message: "Champs manquants" });
      return;
    }

    const {
      title,
      description,
      type,
      organizedBy,
      revealMode,
      revealAt,
      riddle,
      hint,
      answer,
      notes,
    } = req.body;

    const { id } = req.params;

    const organizer = await User.findOne({ name: organizedBy.toLowerCase() });

    !organizer &&
      res
        .status(404)
        .json({ result: false, message: "Organisateur.ice non trouvé.e !" });

    const updatedSurprise = await Surprise.findByIdAndUpdate(
      id,
      {
        ...req.body,
        organizedBy: organizer._id,
      },
      {
        returnDocument: "after",
      },
    ).populate("organizedBy", "name");

    if (updatedSurprise) {
      res.status(200).json({
        result: true,
        updatedSurprise,
        message: "Surprise mise à jour !",
      });
    } else {
      res
        .status(404)
        .json({ result: false, message: "Surprise non trouvée !" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, message: err.message });
  }
});

module.exports = router;
