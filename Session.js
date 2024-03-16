const { log } = require('./utillities/logger');

let sessions = []
class Session {
    constructor(SID) {
        this.SID = SID;
        this.player = null;
    }

    setPlayer(player) {
        this.player = player;
    }

    toString() {
        if (this.player)
            return `SESSION[${this.SID}#${this.player.ID}#${this.player.username}]`
        else
            return `SESSION[${this.SID}#NOT_LOGGED_IN]`
    }
}

function getSessionBySID(SID) {
    return sessions.find(session => session.SID === SID);
}
function getPlayerBySID(SID) {
    return sessions.find(session => session.SID === SID).player;
}

function getPlayerByID(ID) {
    return sessions.find(session => session.player != null && session.player.ID === ID).player;
}

/**
 * Adds a new session. The player isn't necessarily
 * logged in, and they can be tracked using only
 * their SID.
 */
function addSession(SID) {
    if (sessions.some(session => session.SID === SID)) {
        log(`Could not add the same session twice for socket id: ${SID}`);
        return false;
    }

    const session = new Session(SID);
    sessions.push(session);
    log(`${session} started.`);
    return true;
}

/**
 * Looks throughout the existing sessions and 
 * sets the player information accordingly.
 */
function loginPlayerToSession(SID, player) {
    const session = getSessionBySID(SID);
    if (!session) {
        log(`Could not login player to session[SID:${SID}]: session unexisting`);
        return false;
    }
    session.setPlayer(player);
    log(`${player} logged in.`);
    return true;
}

function logoutPlayerFromSession(SID) {
    const session = getSessionBySID(SID);
    if (!session) {
        log(`Could not logout from session[SID:${SID}]: session unexisting.`);
        return false;
    }

    const player = session.player;
    session.setPlayer(null);
    log(`${player} logged off from ${session}.`);
    return true;
}

/**
 * Removes an existing session. 
 * Doesn't matter if the player is logged in or not
 */
function removeSession(SID) {
    const sessionIndex = sessions.findIndex(session => session.SID === SID);
    if (sessionIndex == -1) {
        log(`Could not remove unexisting session of socket id: ${SID}`);
        return false;
    }

    const session = sessions[sessionIndex];
    if (session.player) {
        logoutPlayerFromSession(SID);
    }
    sessions.splice(sessionIndex);
    log(`${session} terminated.`);
    return true;
}

module.exports = {
    sessions,
    addSession,
    loginPlayerToSession,
    removeSession,
    getPlayerBySID,
    getPlayerByID
}