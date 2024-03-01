class Room {
    constuctor(name, ownerId) {
        this.id = generateRoomId();
        this.name = name;
        this.playerIds = [ownerId];
    }

    addPlayer(playerId) {
        if (this.playerIds.includes(playerId)) //Player doesn't exist
            return false;

        //Add player
        this.playerIds.push(playerId);
        return true;
    }

    removePlayer(playerId) {
        if (this.playerIds.includes(playerId)) {
            //Remove existing player
            this.playerIds = this.playerIds.filter(id => id !== playerId);
            return true;
        }
        //Failure
        return false;
    }
}

rooms = []

function createRoom(ownerId, name) {
    if (rooms.some(room => room.playerIds.some(playerId => playerId === ownerId)))
        return -1;

    const room = new Room(name, ownerId);
    rooms.push(room);
    return room.id;
}

function joinRoom(roomId, playerId) {
    const targetRoom = getRoomOfId(roomId);
    if (targetRoom == null)
        return false;

    if (targetRoom.playerIds.some(id => id === playerId))
        return false;

    targetRoom.playerIds.push(playerId);
    return true;
}

function getRoomOfId(id){
    rooms.forEach(room => {
        if (room.id === id) {
            return room;
        }
    });
}

function generateRoomId() {
    let code = nanoid(6); // Generate a random 6-character code
    while (rooms.some(room => room.id === code)) {
        code = nanoid(6); // Generate a new code if it already exists
    }
    return code;
}

module.exports = { createRoom, joinRoom }