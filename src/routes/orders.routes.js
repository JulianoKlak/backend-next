const express = require('express');
const { checkoutOrder, getOrders } = require('../controllers/orders.controller');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.post('/checkout', verifyToken, checkoutOrder);
router.get('/:userId', getOrders);

module.exports = router;
