import CombinationManager from './combinationModel';

const combinationManager = new CombinationManager();

const combinationController = {
    combineElements: async (req, res, next) => {
        console.log("I am at combine elements controller");
        const { element1, element2 } = req.body;
        const combination = await combinationManager.findCombinationInDB(element1, element2);
        const result = combinationManager.getCombination(element1, element2);

        if (combination !== null) {
            res.json({
                success: true,
                result: combination.result,
                emoji: combination.emoji,
            });
        } else {
            res.locals.element1 = element1;
            res.locals.element2 = element2;
            next();
        }
    },

    findCombination: async (req, res, next) => {
        try {
            const { first_word, second_word } = req.body;

            if (!first_word || !second_word) {
                return res.status(400).json({ error: 'Both first_word and second_word are required' });
            }

            const combination = await combinationManager.findCombinationInDB(first_word, second_word);

            if (combination) {
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

    addCombination: async (req, res) => {
        try {
            const { first_word, second_word, result, emoji } = req.body;

            if (!first_word || !second_word || !result) {
                return res.status(400).json({
                    error: 'first_word, second_word, and result are required fields',
                });
            }

            await combinationManager.addCombinationToDB(first_word, second_word, result, emoji);

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
        const result = await combinationManager.askAIforResults(element1, element2);
        res.json({ ...result });
    },
};

export default combinationController;