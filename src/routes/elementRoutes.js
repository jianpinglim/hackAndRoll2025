const express = require('express');
const router = express.Router();
const elementController = require('../controllers/elementController');

// Ensure controller exists before defining routes
router.get('/basic', elementController.getBasicElements);
router.get('/discovered', elementController.getDiscoveredElements);
router.get('/:name', elementController.getElementByName);

module.exports = router;