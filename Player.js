class Player {
    constructor(PID, username, email, phone_number) {
        this.PID = PID;
        this.username = username;
        this.email = email;
        this.phone_number = phone_number;

        this.room = null;
    }

    toString() {
        return `PLAYER[${this.username}#${this.PID}]`;
    }
}

module.exports = { Player }