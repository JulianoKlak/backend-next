const { listProducts, getProductById } = require('../services/products.service');

const getProducts = async (req, res) => {
  try {
    console.log('[products] Buscando lista de produtos');
    const products = await listProducts();
    console.log(`[products] ${products.length} produto(s) encontrado(s)`);
    res.json({ products });
  } catch (error) {
    console.error('[products] Erro ao listar produtos:', error);
    res.status(500).json({ error: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[products] Buscando produto id=${id}`);
    const product = await getProductById(id);

    if (!product) {
      console.log(`[products] Produto id=${id} nao encontrado`);
      return res.status(404).json({ message: 'Produto nao encontrado' });
    }

    console.log(`[products] Produto id=${id} encontrado`);
    res.json({ product });
  } catch (error) {
    console.error('[products] Erro ao buscar produto:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProducts,
  getProduct,
};
