const pool = require('../config/db');

const checkout = async (userId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [cartItems] = await connection.execute(
      `SELECT c.*, p.price, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?
       FOR UPDATE`,
      [userId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return { emptyCart: true };
    }

    let total = 0;

    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        throw new Error(`Estoque insuficiente para o produto ${item.product_id}`);
      }

      total += Number(item.price) * item.quantity;

      await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total, created_at) VALUES (?, ?, NOW())',
      [userId, total]
    );

    await connection.execute('DELETE FROM cart WHERE user_id = ?', [userId]);

    const [rows] = await connection.execute('SELECT * FROM orders WHERE id = ?', [orderResult.insertId]);

    await connection.commit();

    return { emptyCart: false, order: rows[0] };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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
