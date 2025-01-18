class GameState {
    constructor(supabase) {
        this.supabase = supabase;
        this.currentPhase = 'waiting';
        this.roomCode = null;
        this.playerId = null;
        this.champion = null;
    }

    async initializeGame(roomCode) {
        this.roomCode = roomCode;
        await this.subscribeToGameUpdates();
    }

    async subscribeToGameUpdates() {
        return this.supabase
            .channel(`game:${this.roomCode}`)
            .on('presence', { event: 'sync' }, () => {
                this.handlePresenceSync();
            })
            .subscribe();
    }

    async updatePhase(newPhase) {
        this.currentPhase = newPhase;
        await this.supabase
            .from('rooms')
            .update({ status: newPhase })
            .eq('code', this.roomCode);
    }
}