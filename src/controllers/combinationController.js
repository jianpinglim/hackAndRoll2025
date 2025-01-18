const Element = require('../models/elements');
const CombinationManager = require('../models/combination');

const combinationManager = new CombinationManager();

const combinationController = {
    combineElements: async (req, res, next) => {
        const { element1, element2 } = req.body;
        const combination = await this.combinationManager.findCombinationInDB(element1, element2);
        const result = combinationManager.getCombination(element1, element2);
        
        if (combination) {
            res.json({ 
                success: true, 
                result: combination.result,
                emoji: combination.emoji
            });
        } else {
            res.locals.element1 = element1;
            res.locals.element2 = element2;
            next();
            // const newResult = `${element1}${element2}`;
            // await this.combinationManager.addCombinationToDB(element1, element2, result, emoji);
            // combinationManager.addCombination(element1, element2, newResult);
            // res.json({ success: true, result: new Element(newResult, 'combined') });
        }
    },

    async findCombination(req, res) {
        try {
            // Extract first_word and second_word from the request body
            const { first_word, second_word } = req.body;

            if (!first_word || !second_word) {
                return res.status(400).json({ error: 'Both first_word and second_word are required' });
            }

            // Query the database for the combination
            const combination = await this.combinationManager.findCombinationInDB(first_word, second_word);

            if (combination) {
                // If the combination is found, send the result and emoji
                return res.status(200).json({
                    message: 'Combination found',
                    result: combination.result,
                    emoji: combination.emoji,
                });
            } else {
                next();
            }
        } catch (error) {
            console.error('Error in findCombination controller:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Controller for adding a combination
    async addCombination(req, res) {
        try {
            const { first_word, second_word, result, emoji } = req.body;

            // Validate input
            if (!first_word || !second_word || !result) {
                return res.status(400).json({
                    error: 'first_word, second_word, and result are required fields',
                });
            }

            // Add the combination to the database
            await this.combinationManager.addCombinationToDB(first_word, second_word, result, emoji);

            return res.status(201).json({
                message: 'Combination added successfully',
                data: { first_word, second_word, result, emoji },
            });
        } catch (error) {
            console.error('Error in addCombination controller:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    getAllCombinations: (req, res) => {
        const combinations = Array.from(combinationManager.combinations.entries());
        res.json(combinations);
    },

    checkCombination: (req, res) => {
        const { element1, element2 } = req.params;
        const result = combinationManager.getCombination(element1, element2);
        res.json({ exists: !!result, result });
    },

    queryAI: async (req, res) => {
        const element1 = res.locals.element1;
        const element2 = res.locals.element2;
        const result = await this.combinationManager.askAIforResults(element1, element2);
        res.json({...result });
    }


};

module.exports = combinationController;