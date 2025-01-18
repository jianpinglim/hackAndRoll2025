const Element = require('../models/elements');
const CombinationManager = require('../models/combination');

const combinationManager = new CombinationManager();

const combinationController = {
    combineElements: (req, res) => {
        const { element1, element2 } = req.body;
        const result = combinationManager.getCombination(element1, element2);
        
        if (result) {
            res.json({ success: true, result: new Element(result, 'combined') });
        } else {
            const newResult = `${element1}${element2}`;
            combinationManager.addCombination(element1, element2, newResult);
            res.json({ success: true, result: new Element(newResult, 'combined') });
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
    }
};

module.exports = combinationController;