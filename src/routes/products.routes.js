const express = require('express');
const { getProducts, getProduct } = require('../controllers/products.controller');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);

module.exports = router;
