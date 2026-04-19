const service = require("../services/alertas.service");

// 🔔 GET
const getAlertas = async (req, res) => {
  try {
    const data = await service.getAlertas(req.uid);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ DELETE
const deleteAlerta = async (req, res) => {
  try {
    await service.deleteAlerta(req.params.id);
    res.json({ message: "Alerta eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🆕 CREATE (opcional manual)
const createAlerta = async (req, res) => {
  try {
    const { tipo, fecha, placa } = req.body;

    if (!tipo || !fecha || !placa) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    await service.crearAlerta(req.uid, tipo, fecha, placa);

    res.status(201).json({ message: "Alerta creada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAlertas,
  deleteAlerta,
  createAlerta,
};