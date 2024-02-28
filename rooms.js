rooms=[]

function create_room(name, ownerId){
    rooms.push({
        id: "",
        name: "",
        playerIds: [ownerId]
    });
}

module.exports={create_room}