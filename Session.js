const { log } = require('./utillities/logger');
const EventEmitter = require('events');

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
            return `SESSION[${this.SID}#${this.player.ID}#${this.player.username}]`
        else
            return `SESSION[${this.SID}#NOT_LOGGED_IN]`
    }
}

///SESSIONS
let sessions = []

///EVENTS
const sessionsEvent = new EventEmitter();

///LOGIC
function getSessionBySID(SID) {
    return sessions.find(session => session.SID === SID);
}
function getPlayerBySID(SID) {
    return sessions.find(session => session.SID === SID).player;
}
function getPlayerByPID(ID) {
    return sessions.find(session => session.player != null && session.player.ID === ID).player;
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
function loginPlayerToSession(SID, player) {
    const session = getSessionBySID(SID);
    //check if the session exists
    if (!session) {
        log(`Could not login player to unexisting session of SID:${SID}`);
        return false;
    }
    //check if the player is already logged in
    const existingPlayer = getPlayerByPID(player.PID);
    if(existingPlayer != null){
        log(`${player} failed to login from 2 different devices at the same time`);
        return false;
    }

    //Login
    session.setPlayer(player);
    sessionsEvent.emit("login", session, player);
    log(`${player} logged in.`);
    return true;
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
    sessions.splice(sessionIndex);
    log(`${session} terminated.`);
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
    sessionsEvent
}