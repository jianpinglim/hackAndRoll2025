class Room {
    constructor(roomId) {
        this.roomId = roomId;
        this.players = [];
    }

    joinRoom(player) {
        if (!this.players.includes(player)) {
            this.players.push(player);
            this.broadcast(`${player} has joined the room.`);
        }
    }

    leaveRoom(player) {
        this.players = this.players.filter(p => p !== player);
        this.broadcast(`${player} has left the room.`);
    }

    broadcast(message) {
        // Logic to send message to all players in the room
        console.log(`Broadcast to room ${this.roomId}: ${message}`);
    }
}

export default Room;