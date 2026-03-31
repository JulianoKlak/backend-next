const express = require('express');
const { register, login, changePassword } = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/change-password', verifyToken, changePassword);

module.exports = router;
