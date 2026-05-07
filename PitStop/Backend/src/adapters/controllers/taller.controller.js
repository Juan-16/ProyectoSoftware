const ConfigCitasInput = require("../../usecases/input/taller/ConfigCitasInput")
const CreateTallerInput = require("../../usecases/input/taller/CreateTallerInput")
const SaveServiciosInput = require("../../usecases/input/taller/SaveServiciosInput")
const UpdateTallerInput = require("../../usecases/input/taller/UpdateTallerInput")
const {GetTallerOutput, GetTallerByIdOutput} = require("../../usecases/output/GetTallerOutput.js")
const GetTalleresOutput = require("../../usecases/output/GetTalleresOutput")

const createTaller = async (req, res) => {
  try {
    await CreateTallerInput(req.uid, req.body);
    res.json({ message: "Perfil taller guardado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTallerInfo = async (req, res) => {
  try {
    const data = await GetTallerOutput(req.uid);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateTaller = async (req, res) => {
  try {
    await UpdateTallerInput(req.uid, req.body);
    res.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveServicios = async (req, res) => {
  try {
    await SaveServiciosInput(req.uid, req.body);
    res.json({ message: "Servicios guardados correctamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCercanos = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Lat y lng requeridos" });
    }

    const data = await GetTalleresOutput(
      parseFloat(lat),
      parseFloat(lng)
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTallerById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID requerido" });
    }

    const taller = await GetTallerByIdOutput(id);

    res.json(taller);
  } catch (error) {
    if (error.message === "Taller no encontrado") {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};

const guardarConfiguracionCitas = async (req, res) => {
  try {
    await ConfigCitasInput(req.uid, req.body);

    res.json({ message: "Configuración guardada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTaller,
  getTallerInfo,
  updateTaller,
  saveServicios,
  getCercanos,
  getTallerById,
  guardarConfiguracionCitas,
};