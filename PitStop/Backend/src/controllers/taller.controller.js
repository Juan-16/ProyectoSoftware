
const service = require("../services/taller.service");

const createTaller = async (req, res) => {
  try {
    await service.createTaller(req.uid, req.body);
    res.json({ message: "Perfil taller guardado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTallerInfo = async (req, res) => {
  try {
    const data = await service.getTallerInfo(req.uid);
    res.json(data);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const updateTaller = async (req, res) => {
  try {
    await service.updateTaller(req.uid, req.body);
    res.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveServicios = async (req, res) => {
  try {
    await service.saveServicios(req.uid, req.body);
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

    const data = await service.getTalleresCercanos(
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

    const taller = await service.getTallerById(id);

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
    await service.guardarConfiguracionCitas(req.uid, req.body);

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