const express = require("express");
const sessionRouter = express.Router();
const { Player, generatePlayerId } = require(`../Player`);
const {
    loginPlayerToSession,
    removeSession
} = require('../Session.js');

// Route definitions
sessionRouter.post("/session/login", (req, res) => {
    const { session, username } = req.body;

    const PID = generatePlayerId();
    if (!loginPlayerToSession(session.SID, new Player(PID, username))) {
        res.status(500).json({
            error: "Could not login."
        });
        return;
    }

    res.status(200).json({
        PID,
        username
    });
});

module.exports = sessionRouter;