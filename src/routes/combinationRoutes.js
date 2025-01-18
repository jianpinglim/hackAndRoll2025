const express = require('express');
const router = express.Router();
const combinationController = require('../controllers/combinationController');

router.post('/combine', combinationController.combineElements);
router.get('/all', combinationController.getAllCombinations);
router.get('/check/:element1/:element2', combinationController.checkCombination);

module.exports = router;