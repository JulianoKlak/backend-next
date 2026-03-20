const {
  addToCart,
  getCartByUserId,
  updateCartItem,
  removeCartItem,
} = require('../services/cart.service');

const addCartItem = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.userId;

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantidade deve ser maior que 0' });
    }

    const cart = await addToCart({
      userId,
      productId: product_id,
      quantity,
    });

    res.json({ message: 'Produto adicionado ao carrinho', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await getCartByUserId(userId);
    res.json({ cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({ message: 'Quantidade e obrigatoria' });
    }

    const cart = await updateCartItem({ cartId, quantity });
    res.json({ message: 'Carrinho atualizado', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    await removeCartItem(cartId);
    res.json({ message: 'Item removido do carrinho' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addCartItem,
  getCart,
  updateCart,
  deleteCart,
};
