const express = require('express');
const {
  addCartItem,
  getCart,
  updateCart,
  deleteCart,
} = require('../controllers/cart.controller');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.post('/add', verifyToken, addCartItem);
router.get('/:userId', getCart);
router.put('/:cartId', verifyToken, updateCart);
router.delete('/:cartId', verifyToken, deleteCart);

module.exports = router;
