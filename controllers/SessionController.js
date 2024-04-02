const { log } = require("../utillities/logger.js");
const { Player } = require(`../Player.js`);
const {
    loginPlayerToSession,
    removeSession,
    getSessionBySID
} = require('../Session.js');
const { getDb } = require(`../database/Database.js`);

// Route definitions
async function login(req, res) {
    const { sessionInfo, identifier, password } = req.body;
    if (identifier == null || password == null) {
        res.status(500).json({
            error: `Cannot login without an Identifier and a Password`
        });
        return;
    }

    //The identifier can be a phone number or an email 
    log(`New connection attempt with identifier(${identifier}) and password(${password})`);
    const db = getDb();
    try {
        const queryByEmail = db.collection('accounts').where('email', '==', identifier).limit(1);
        const queryByPhoneNumber = db.collection('accounts').where('phone_number', '==', identifier).limit(1);

        // Execute both queries simultaneously
        const [accountByEmail, accountByPhoneNumber] = await Promise.all([
            queryByEmail.get(),
            queryByPhoneNumber.get()
        ]);

        //Check identifier
        const accountDoc = accountByEmail.empty ? accountByPhoneNumber.docs[0] : accountByEmail.docs[0];
        if (!accountDoc)
            throw new Error('Invalid Credentials');

        //Check password
        const accountData = accountDoc.data();
        if (accountData.password !== password)
            throw new Error('Invalid Credentials');

        const player = loginPlayerToSession(sessionInfo.SID, accountDoc.id, accountData.username, accountData.email, accountData.phone_number);
        res.status(200).json({ networkPlayer: player.getNetworkPlayerInfo() });
    } catch (error) {
        res.status(500).json({
            error
        });

        log(`login error: ${error}`);
    };
};

module.exports = { login };