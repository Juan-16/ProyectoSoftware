const service = require("../services/persona.service");
const CreatePersonaInput = require("../../usecases/input/persona/CreatePersonaInput");
const UpdatePersonaInput = require("../../usecases/input/persona/UpdatePersonaInput");
const GetProfileOutput = require("../../usecases/output/GetProfileOutput");

const createPersona = async (req, res) => {
  try {
    await CreatePersonaInput(req.uid, req.body);
    res.json({ message: "Perfil persona guardado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const data = await GetProfileOutput(req.uid);
    res.json(data || { uid: req.uid, tipo: null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePersonaController = async (req, res) => {
  try {
    const uid = req.uid; // 🔥 CORREGIDO
    const data = req.body;

    await UpdatePersonaInput(uid, data); // 🔥 CORREGIDO

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