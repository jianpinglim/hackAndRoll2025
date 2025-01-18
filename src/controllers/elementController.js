const Element = require('../models/elements');
const CombinationManager = require('../models/combination');

const combinationManager = new CombinationManager();

const elementController = {
    getBasicElements: (req, res) => {
        const basicElements = ['Water', 'Fire', 'Earth', 'Air']
            .map(name => new Element(name, 'basic'));
        res.json(basicElements);
    },

    getDiscoveredElements: (req, res) => {
        const elements = combinationManager.getAllElements()
            .map(name => new Element(name));
        res.json(elements);
    },

    getElementByName: (req, res) => {
        const { name } = req.params;
        const element = new Element(name);
        res.json(element);
    }
};

module.exports = elementController;