const service = require("./persona.service");

const createPersona = async (req, res) => {
  try {
    await service.createPersona(req.uid, req.body);
    res.json({ message: "Perfil persona guardado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const data = await service.getProfile(req.uid);
    res.json(data || { uid: req.uid, tipo: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePersonaController = async (req, res) => {
  try {
    const uid = req.uid; // 🔥 CORREGIDO
    const data = req.body;

    await service.updatePersona(uid, data); // 🔥 CORREGIDO

    res.json({
      ok: true,
      message: "Perfil actualizado correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      ok: false,
      message: "Error al actualizar perfil",
    });
  }
};

module.exports = {
  createPersona,
  getMe,
  updatePersonaController,
};