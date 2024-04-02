class Player {
    constructor(session, PID, username, email, phone_number) {
        this.PID = PID;
        this.username = username;
        this.email = email;
        this.phone_number = phone_number;

        this.room = null;
        this.session = session;
    }

    toString() {
        return `PLAYER[${this.username}#${this.PID}]`;
    }

    getNetworkPlayerInfo(){
        return {
            PID: this.PID,
            username: this.username,
        }
    }
}

module.exports = { Player }