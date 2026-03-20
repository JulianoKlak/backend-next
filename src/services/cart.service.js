const pool = require('../config/db');

const addToCart = async ({ userId, productId, quantity }) => {
  const [result] = await pool.execute(
    'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
    [userId, productId, quantity]
  );

  const [rows] = await pool.execute('SELECT * FROM cart WHERE id = ?', [result.insertId]);

  return rows[0];
};

const getCartByUserId = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT c.*, p.name, p.price, p.stock
     FROM cart c
     JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ?`,
    [userId]
  );

  return rows;
};

const updateCartItem = async ({ cartId, quantity }) => {
  await pool.execute(
    'UPDATE cart SET quantity = ? WHERE id = ?',
    [quantity, cartId]
  );

  const [rows] = await pool.execute('SELECT * FROM cart WHERE id = ?', [cartId]);

  return rows[0];
};

const removeCartItem = async (cartId) => {
  await pool.execute('DELETE FROM cart WHERE id = ?', [cartId]);
};

module.exports = {
  addToCart,
  getCartByUserId,
  updateCartItem,
  removeCartItem,
};
