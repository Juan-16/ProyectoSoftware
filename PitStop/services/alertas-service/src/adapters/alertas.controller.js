const CrearAlertaInput = require("../usecases/input/CrearAlertaInput")
const DeleteAlertaInput = require("../usecases/input/DeleteAlertaInput")
const CrearAlertaManual = require("../usecases/input/CreateAlertaManualInput")
const DeleteAlertasByVehiculo = require("../usecases/input/DeleteAlertasByVehiculoInput")
const GetAlertasOutput = require("../usecases/output/GetAlertasOutput");


// 🔔 GET
const getAlertas = async (req, res) => {
  try {
    const data = await GetAlertasOutput(req.uid);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ DELETE
const deleteAlerta = async (req, res) => {
  try {
    await DeleteAlertaInput(req.params.id);
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

    await CrearAlertaManualInput(req.uid, tipo, fecha, placa);

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