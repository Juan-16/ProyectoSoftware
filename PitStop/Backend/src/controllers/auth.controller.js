const service = require("../services/auth.service");

const login = async (req, res) => {
  try {
    const data = await service.login(req.body.email, req.body.password);
    res.json(data);
  } catch (error) {
    if (error.message.includes("bloqueada")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes("incorrecta")) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const register = async (req, res) => {
  try {
    const data = await service.register(req.body.email, req.body.password);
    res.status(201).json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    await service.sendPasswordReset(req.body.email);
    res.json({ message: "Correo enviado" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
};