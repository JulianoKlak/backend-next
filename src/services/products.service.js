const pool = require('../config/db');

const listProducts = async () => {
  const [rows] = await pool.execute('SELECT * FROM products');
  return rows;
};

const getProductById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0] || null;
};

module.exports = {
  listProducts,
  getProductById,
};
