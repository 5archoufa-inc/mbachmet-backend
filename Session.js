const { log } = require('./utillities/logger');
const EventEmitter = require('events');
const { Player } = require('./Player');

class Session {
    constructor(socket) {
        this.socket = socket;
        this.SID = socket.id;
        this.player = null;
    }

    setPlayer(player) {
        this.player = player;
    }

    toString() {
        if (this.player)
            return `SESSION[${this.SID}#${this.player.username}#${this.player.PID}]`
        else
            return `SESSION[${this.SID}#NOT_LOGGED_IN]`
    }
}

///SESSIONS
let sessions = []
/*async function infinito() {
    while (true) {
        log(`active sessions(${sessions.length}):`);
        sessions.forEach(session => log(`${session}`));
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
    }
}
infinito();*/

///EVENTS
const sessionsEvent = new EventEmitter();

///LOGIC
function getSessionBySID(SID) {
    return sessions.find(session => session.SID === SID);
}
function getPlayerBySID(SID) {
    return sessions.find(session => session.SID === SID).player;
}
function getPlayerByPID(PID) {
    return sessions.find(session => session.player?.PID === PID)?.player;
}

/**
 * Adds a new session. The player isn't necessarily
 * logged in, and they are tracked using their socket and SID (socket ID).
 */
function addSession(socket) {
    if (sessions.some(session => session.SID === socket.id)) {
        log(`Could not add the same session twice for socket id: ${socket.SID}`);
        return false;
    }

    const session = new Session(socket);
    sessions.push(session);
    log(`${session} started.`);
    return true;
}

/**
 * Looks throughout the existing sessions and 
 * sets the player information accordingly.
 */
function loginPlayerToSession(SID, PID, username, email, phone_number) {
    const session = getSessionBySID(SID);
    //check if the session exists
    if (!session)
        throw new Error(`Could not login player to unexisting session of SID:${SID}`);

    //check if the player is already logged in
    const existingPlayer = getPlayerByPID(PID);
    if (existingPlayer)
        throw new Error(`${username}#${PID} failed to login from 2 different devices at the same time`);

    //Login
    const player = new Player(session, PID, username, email, phone_number);
    session.setPlayer(player);
    log(`${player} logged in to ${session}`);
    sessionsEvent.emit("login", session, player);
    return player;
}

function logoutPlayerFromSession(SID, triggerEvent = true) {
    const session = getSessionBySID(SID);
    if (!session) {
        log(`Could not logout from session[SID:${SID}]: session unexisting.`);
        return false;
    }

    const player = session.player;
    session.setPlayer(null);
    log(`${player} logged out from ${session}.`);
    if (triggerEvent)
        sessionsEvent.emit("logout", session, player);
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
    sessions.splice(sessionIndex, 1);
    sessionsEvent.emit("terminate", session);
    return true;
}

///EXPORTS
module.exports = {
    addSession,
    loginPlayerToSession,
    removeSession,
    getPlayerBySID,
    getPlayerByPID,
    getSessionBySID,
    sessionsEvent
}