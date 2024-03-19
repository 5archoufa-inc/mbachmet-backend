const express = require("express");
const sessionRouter = express.Router();
const { log } = require("../utillities/logger.js");
const { Player, generatePlayerId } = require(`../Player.js`);
const {
    loginPlayerToSession,
    removeSession
} = require('../Session.js');
const { db } = require(`../Database.js`);

// Route definitions
sessionRouter.post("/session/login", async (req, res) => {
    const { session, identifier, password } = req.body;
    //The identifier can be a phone number or an email 

    log(`New connection attempt with identifier(${identifier}) and password(${password})`);
    //Try login with an email
    try {
        const queryByEmail = db.collection('accounts').where('email', '==', identifier).limit(1);
        const queryByPhoneNumber = db.collection('accounts').where('phone_number', '==', identifier).limit(1);

        // Execute both queries simultaneously
        const [accountByEmail, accountByPhoneNumber] = await Promise.all([
            queryByEmail.get(),
            queryByPhoneNumber.get()
        ]);

        const accountDoc = accountByEmail.empty ? accountByPhoneNumber.docs[0] : accountByEmail.docs[0];
        if (accountDoc) {
            const accountData = accountDoc.data();
            if (accountData.password === password) {
                const player = new Player(accountDoc.id, accountData.username, accountData.email, accountData.phone_number);
                if (!loginPlayerToSession(session.SID, player)) {
                    res.status(500).json({
                        error: "Could not login from 2 different accounts on the same session."
                    });
                    log(`Login failed: login from 2 different accounts on the same session.`);
                    return;
                }
                res.status(200).json({
                    PID: player.PID,
                    username: player.username
                });
                return;
            } else {
                res.status(500).json({
                    error: "Invalid Credentials."
                });
                log(`Login failed: invalid credentials.`);
                return;
            }
        }
    } catch (error) {
        res.status(500).json({
            error: "Internal server error."
        });
        log(`login error: ${error}`);
    };
});

module.exports = sessionRouter;