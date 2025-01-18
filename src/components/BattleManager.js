class BattleManager {
    constructor(supabase) {
        this.supabase = supabase;
    }

    async startBattle(room_code, player1_champion, player2_champion) {
        try {
            const { data, error } = await this.supabase
                .from('battle_results')
                .insert({
                    room_code,
                    winner_id: player1_champion.id,
                    loser_id: player2_champion.id,
                    battle_log: `${player1_champion.name} vs ${player2_champion.name}`
                })
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Battle error:', error);
            throw error;
        }
    }
}