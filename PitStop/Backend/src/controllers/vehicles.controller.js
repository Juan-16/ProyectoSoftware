const service = require("../services/vehicles.service");

// 🚗 crear vehículo
const createVehiculo = async (req, res) => {
  try {
    await service.createVehiculo(req.uid, req.body);
    res.json({ message: "Vehículo y alertas creadas" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📥 obtener vehículos
const getVehiculos = async (req, res) => {
  try {
    const data = await service.getVehiculos(req.uid);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo vehículos" });
  }
};

// 🔔 alerta manual
const createAlerta = async (req, res) => {
  try {
    await service.createAlertaManual(req.uid, req.body);
    res.status(201).json({ message: "Alerta creada" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ❌ eliminar vehículo
const deleteVehiculo = async (req, res) => {
  try {
    await service.deleteVehiculo(req.uid, req.params.placa);
    res.json({ message: "Vehículo eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createVehiculo,
  getVehiculos,
  createAlerta,
  deleteVehiculo,
};