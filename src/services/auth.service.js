const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const detectCardBrand = (cardNumber) => {
  if (/^4/.test(cardNumber)) {
    return 'Visa';
  }

  if (/^(5[1-5]|2[2-7])/.test(cardNumber)) {
    return 'Mastercard';
  }

  if (/^3[47]/.test(cardNumber)) {
    return 'Amex';
  }

  if (/^6/.test(cardNumber)) {
    return 'Elo';
  }

  return 'Cartao';
};

const buildUserPayload = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  zipCode: user.zip_code,
  street: user.street,
  streetNumber: user.street_number,
  neighborhood: user.neighborhood,
  city: user.city,
  state: user.state,
  cardHolderName: user.card_holder_name,
  cardBrand: user.card_brand,
  cardLastFour: user.card_last_four,
  cardExpiryMonth: user.card_expiry_month,
  cardExpiryYear: user.card_expiry_year,
});

const registerUser = async ({
  name,
  email,
  password,
  zipCode,
  street,
  streetNumber,
  neighborhood,
  city,
  state,
  cardHolderName,
  cardNumber,
  cardExpiry,
}) => {
  const sanitizedCardNumber = String(cardNumber || '').replace(/\D/g, '');
  const [expiryMonth = '', expiryYear = ''] = String(cardExpiry || '').split('/');

  const [result] = await pool.execute(
    `INSERT INTO users (
      name,
      email,
      password,
      zip_code,
      street,
      street_number,
      neighborhood,
      city,
      state,
      card_holder_name,
      card_brand,
      card_last_four,
      card_expiry_month,
      card_expiry_year
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      email,
      password,
      zipCode,
      street,
      streetNumber,
      neighborhood,
      city,
      state,
      cardHolderName,
      detectCardBrand(sanitizedCardNumber),
      sanitizedCardNumber.slice(-4),
      expiryMonth,
      expiryYear.length === 2 ? `20${expiryYear}` : expiryYear,
    ]
  );

  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE id = ?',
    [result.insertId]
  );

  return buildUserPayload(rows[0]);
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
    user: buildUserPayload(user),
  };
};

const changePasswordUser = async ({ userId, currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    const error = new Error('Senha atual e nova senha sao obrigatorias');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('A nova senha deve ter pelo menos 6 caracteres');
    error.statusCode = 400;
    throw error;
  }

  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
  const user = rows[0];

  if (!user) {
    const error = new Error('Usuario nao encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (user.password !== currentPassword) {
    const error = new Error('Senha atual invalida');
    error.statusCode = 400;
    throw error;
  }

  await pool.execute(
    'UPDATE users SET password = ? WHERE id = ?',
    [newPassword, userId]
  );
};

module.exports = {
  registerUser,
  loginUser,
  changePasswordUser,
};
