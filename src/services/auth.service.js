const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const registerUser = async ({ name, email, password }) => {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  );

  const [rows] = await pool.execute(
    'SELECT id, name, email FROM users WHERE id = ?',
    [result.insertId]
  );

  return rows[0];
};

const loginUser = async ({ email, password }) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

  if (rows.length === 0) {
    return null;
  }

  const user = rows[0];

  if (user.password !== password) {
    return false;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    'secret123',
    { expiresIn: '24h' }
  );

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

module.exports = {
  registerUser,
  loginUser,
};
