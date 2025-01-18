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
}

module.exports = CombinationManager;