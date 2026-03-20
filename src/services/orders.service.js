const pool = require('../config/db');

const checkout = async (userId) => {
  const [cartItems] = await pool.execute(
    `SELECT c.*, p.price, p.stock
     FROM cart c
     JOIN products p ON c.product_id = p.id
     WHERE c.user_id = ?`,
    [userId]
  );

  if (cartItems.length === 0) {
    return { emptyCart: true };
  }

  let total = 0;

  for (const item of cartItems) {
    total += Number(item.price);
  }

  const [orderResult] = await pool.execute(
    'INSERT INTO orders (user_id, total, created_at) VALUES (?, ?, NOW())',
    [userId, total]
  );

  await pool.execute('DELETE FROM cart WHERE user_id = ?', [userId]);

  const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderResult.insertId]);

  return { emptyCart: false, order: rows[0] };
};

const getOrdersByUserId = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  return rows;
};

module.exports = {
  checkout,
  getOrdersByUserId,
};
