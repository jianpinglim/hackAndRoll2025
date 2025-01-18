const pool = require('../services/db');

class CombinationManager {
    constructor() {
        this.combinations = new Map();
        this.elements = new Set(['Water', 'Fire', 'Earth', 'Air']);
        
        // Initialize basic combinations
        this.addCombination('Water', 'Earth', 'Mud');
        this.addCombination('Fire', 'Earth', 'Lava');
        this.addCombination('Air', 'Water', 'Steam');
        this.addCombination('Fire', 'Air', 'Smoke');
    }

    addCombination(element1, element2, result) {
        const key = [element1, element2].sort().join(',');
        this.combinations.set(key, result);
        this.elements.add(result);
    }

    getCombination(element1, element2) {
        const key = [element1, element2].sort().join(',');
        return this.combinations.get(key);
    }

    getAllElements() {
        return Array.from(this.elements);
    }

    // Integrate database methods

    async findCombinationInDB(firstWord, secondWord) {
        try {
            const query = `
                SELECT result, emoji
                FROM word_cache
                WHERE 
                  (first_word = $1 AND second_word = $2)
                  OR (first_word = $2 AND second_word = $1)
                LIMIT 1;
            `;
            const values = [firstWord, secondWord];
            const result = await pool.query(query, values);

            if (result.rows.length > 0) {
                return result.rows[0]; // Return result and emoji
            } else {
                return null; // No match found
            }
        } catch (error) {
            console.error('Error querying the database:', error);
            throw error;
        }
    }

    async addCombinationToDB(firstWord, secondWord, result, emoji) {
        try {
            const query = `
                INSERT INTO word_cache (first_word, second_word, result, emoji)
                VALUES ($1, $2, $3, $4);
            `;
            const values = [firstWord, secondWord, result, emoji];
            await pool.query(query, values);
            console.log('Combination added to database successfully');
        } catch (error) {
            console.error('Error inserting into the database:', error);
            throw error;
        }
    }
}

module.exports = CombinationManager;