const pool = require('../config/db');

const validPaymentMethods = new Set(['pix', 'credit_card', 'debit_card', 'boleto']);

const buildValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const normalizeCheckoutData = (checkoutData = {}) => {
  const normalizedData = {
    customerName: checkoutData.customerName?.trim(),
    zipCode: checkoutData.zipCode?.trim(),
    street: checkoutData.street?.trim(),
    streetNumber: checkoutData.streetNumber?.trim(),
    neighborhood: checkoutData.neighborhood?.trim(),
    city: checkoutData.city?.trim(),
    state: checkoutData.state?.trim(),
    paymentMethod: checkoutData.paymentMethod?.trim(),
  };

  const requiredFields = [
    ['customerName', 'Nome do destinatario'],
    ['zipCode', 'CEP'],
    ['street', 'Rua'],
    ['streetNumber', 'Numero'],
    ['neighborhood', 'Bairro'],
    ['city', 'Cidade'],
    ['state', 'Estado'],
    ['paymentMethod', 'Forma de pagamento'],
  ];

  for (const [field, label] of requiredFields) {
    if (!normalizedData[field]) {
      throw buildValidationError(`${label} e obrigatorio`);
    }
  }

  if (!validPaymentMethods.has(normalizedData.paymentMethod)) {
    throw buildValidationError('Forma de pagamento invalida');
  }

  return normalizedData;
};

const checkout = async (userId, checkoutData) => {
  const connection = await pool.getConnection();

  try {
    const normalizedCheckoutData = normalizeCheckoutData(checkoutData);
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
      `INSERT INTO orders (
        user_id,
        total,
        customer_name,
        zip_code,
        street,
        street_number,
        neighborhood,
        city,
        state,
        payment_method,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        total,
        normalizedCheckoutData.customerName,
        normalizedCheckoutData.zipCode,
        normalizedCheckoutData.street,
        normalizedCheckoutData.streetNumber,
        normalizedCheckoutData.neighborhood,
        normalizedCheckoutData.city,
        normalizedCheckoutData.state,
        normalizedCheckoutData.paymentMethod,
      ]
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
