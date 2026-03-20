const { checkout, getOrdersByUserId } = require('../services/orders.service');

const checkoutOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await checkout(userId);

    if (result.emptyCart) {
      return res.status(400).json({ message: 'Carrinho vazio' });
    }

    res.json({ message: 'Pedido criado com sucesso', order: result.order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await getOrdersByUserId(userId);
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  checkoutOrder,
  getOrders,
};
