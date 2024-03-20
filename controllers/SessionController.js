const { log } = require("../utillities/logger.js");
const { Player } = require(`../Player.js`);
const {
    loginPlayerToSession,
    removeSession
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
    
    //functions
    const onInvalidCredentials = ()=>{
        res.status(500).json({
            error: "Invalid Credentials."
        });
        log(`Login failed: invalid credentials.`);
    };

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

        const accountDoc = accountByEmail.empty ? accountByPhoneNumber.docs[0] : accountByEmail.docs[0];
        if (accountDoc) {
            const accountData = accountDoc.data();
            if (accountData.password === password) {
                const player = new Player(accountDoc.id, accountData.username, accountData.email, accountData.phone_number);
                if (!loginPlayerToSession(sessionInfo.SID, player)) {
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
                onInvalidCredentials();
                return;
            }
        }else{
            onInvalidCredentials();
            return;
        }
    } catch (error) {
        res.status(500).json({
            error: "Internal server error."
        });
        log(`login error: ${error}`);
    };
};

module.exports = { login };