const { registerUser, loginUser } = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const {
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
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nome e obrigatorio' });
    }

    const user = await registerUser({
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
    });

    res.status(201).json({
      message: 'Usuario criado com sucesso',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });

    if (result === null || result === false) {
      return res.status(401).json({ message: 'Email ou senha invalidos' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
};
