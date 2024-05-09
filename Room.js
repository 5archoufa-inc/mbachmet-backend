const { Player } = require("./Player");
const { sessionsEvent } = require("./Session");
const { log } = require('./utillities/logger');
const { createNumberGenerator } = require("./utillities/codeGenerator");
let generateRoomId = null;
createNumberGenerator(6).then(generator => {
    generateRoomId = generator;
});

const RoomState = {
    InLobby: "In Lobby",
    WaitingPlayersLoad: "Waiting for Players to Load",
    Playing: "Playing",
};

class Room {
    constructor(title, hostSession) {
        this.id = generateRoomId();
        this.title = title;
        this.players = [];
        this.hostSession = hostSession;
        this.state = RoomState.InLobby;

        ///Is called by host to launch a new game
        hostSession.socket.on("Launch", () => {
            if (this.state !== RoomState.InLobby || this.players.length == 0) {
                log(`${this} FAILED to launch game`);
                return;
            }

            log(`Will launch a game at:`);
            this.setRoomState(RoomState.WaitingPlayersLoad);

            //Wait for everyone to load
            hostSession.socket.on("OnLoaded", () => {
                log(`Host is ready!`);
                this.isHostLoaded = true;
                hostSession.socket.removeAllListeners("OnLoaded");
                this.onSomeoneGotLoaded();
            })
            this.players.forEach(roomPlayer => {
                roomPlayer.session.socket.on("OnLoaded", () => {
                    log(`${roomPlayer} is ready!`);
                    roomPlayer.isLoaded = true;
                    roomPlayer.session.socket.removeAllListeners("OnLoaded");
                    this.onSomeoneGotLoaded();
                })
            });
        });
    }

    setRoomState(state) {
        console.log(`${this} switched to state: ${state}`);
        this.state = state;
        //Inform host
        this.hostSession.socket.emit("OnRoomStateUpdate", state);
        //Inform players
        this.players.forEach(roomPlayer => {
            roomPlayer.session.socket.emit("OnRoomStateUpdate", state);
            if (state === RoomState.Playing) {
                roomPlayer.session.socket.on("RemoteControl", (playerAction, actionDataList) => {
                    console.log(playerAction, actionDataList);
                    this.hostSession?.socket.emit("RemoteControl", { playerAction: playerAction, actionDataList: actionDataList, age:291 });
                });
            }
        });

        if (state !== RoomState.Playing) {
            this.players.forEach(roomPlayer => {
                roomPlayer.session.socket.removeAllListeners("RemoteControl");
            });
        }
    }

    /**
     * Checks if everyone is loaded, and if so, stars the game.
     */
    onSomeoneGotLoaded() {
        if (!this.isHostLoaded)
            return;
        for (let i = 0; i < this.players.length; i++) {
            if (!this.players[i].isLoaded)
                return;
        }

        //Everyone is loaded!
        this.setRoomState(RoomState.Playing);
    }

    /**
     * Performs the necessary checks to ensure that the player can be properly added.
     */
    addPlayer(player) {
        if (player.room?.id === this.id) //Player already a member
            return;
        else if (player.room != null)
            throw new Error(`Unable to add player to room: ${player} is already a member of another room`);

        //Inform host
        const RoomPlayerStateUpdate = {
            player: player.getNetworkPlayerInfo(),
            isInRoom: true
        };
        console.log(RoomPlayerStateUpdate);
        this.hostSession.socket.emit("OnRoomPlayerStateUpdate", RoomPlayerStateUpdate);

        //Inform room players
        this.players.forEach(roomPlayer => {
            roomPlayer.session.socket.emit("OnRoomPlayerStateUpdate", RoomPlayerStateUpdate);
        });

        //Add player
        player.room = this;
        this.players.push(player);

        log(`${this} added ${player}`);
    }

    removePlayer(player, informOtherPlayers = true) {
        const index = this.players.findIndex(p => p.PID === player.PID);
        if (index === -1)
            return;

        //Inform host
        const RoomPlayerStateUpdate = {
            player: player.getNetworkPlayerInfo(),
            isInRoom: false
        };
        this.hostSession.socket.emit("OnRoomPlayerStateUpdate", RoomPlayerStateUpdate);

        //Inform room players
        if (informOtherPlayers) {
            this.players.forEach(roomPlayer => {
                roomPlayer.session.socket.emit("OnRoomPlayerStateUpdate", RoomPlayerStateUpdate);
            });
        } else {
            player.session.socket.emit("OnRoomPlayerStateUpdate", RoomPlayerStateUpdate);
        }

        //Remove player
        this.players.splice(index, 1);
        player.room = null;

        log(`${this} removed ${player}`);
    }

    hasPlayer(PID) {
        return this.players.some(player => player.PID === PID);
    }

    toString() {
        return `ROOM(${this.state})[${this.title}#${this.id}<(${this.players.length})players>]`;
    }

    /**
     * Is called when a room is destroyed and removed from the list of rooms.
     * Kicks out all players from the room
     */
    destroy() {
        this.hostSession?.socket?.removeAllListeners("Launch");
        this.players.forEach(player => {
            this.removePlayer(player, false);
        })
        this.id = null;
        this.hostSession = null;
        this.title = null;
    }
}

///ROOMS
let rooms = []

///EVENTS
sessionsEvent.on("logout", (session, player) => {
    if (player.room == null)
        return;

    player.room.removePlayer(player);
});

sessionsEvent.on("terminate", (session) => {
    for (const room of rooms) {
        if (room.hostSession.SID === session.SID) {
            destroyRoom(room.id);
            break;
        }
    }
})


///LOGIC
/**
 * Can only create a room of the owner exists and does not belong to any other room.
 */
function createRoom(title, hostSession) {
    for (const room of rooms) {
        if (room.hostSession.SID === hostSession.SID) {
            throw new Error(`${hostSession} is already hosting ${room}.`);
        }
    }
    const room = new Room(title, hostSession);
    rooms.push(room);
    return room;
}

function joinRoom(room, player) {
    /*const room = getRoomOfId(roomId);
    if (room == null) {
        throw new Error(`No room of id(${hostSession}).`);
    }*/
    room.addPlayer(player);
}

function destroyRoom(roomId) {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].id === roomId) {
            log(`Destroyed ${rooms[i]}.`);
            rooms[i].destroy();
            rooms.splice(i, 1);
            return;
        }
    }

    log(`Could not destroy unexisting room of ID(${roomId})`);
}

function getRoomOfId(id) {
    for (const room of rooms) {
        if (room.id === id) {
            return room;
        }
    }
}

module.exports = { Room, createRoom, joinRoom, getRoomOfId }