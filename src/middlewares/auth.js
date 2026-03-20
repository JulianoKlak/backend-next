const jwt = require('jsonwebtoken');

// Middleware para verificar token (BUGADO)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    // BUG #10: Nao valida token corretamente
    return res.status(401).json({ message: 'Token nao fornecido' });
  }

  try {
    const decoded = jwt.verify(token, 'secret123');
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalido' });
  }
};

module.exports = {
  verifyToken,
};
