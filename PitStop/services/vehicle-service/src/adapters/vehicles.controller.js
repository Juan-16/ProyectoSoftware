const service = require("../vehicles.service");

const createVehiculo = async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    await service.createVehiculo(req.uid, req.body, token);
    res.json({ message: "Vehículo y alertas creadas" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getVehiculos = async (req, res) => {
  try {
    const data = await service.getVehiculos(req.uid);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo vehículos" });
  }
};

const createAlerta = async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    await service.createAlertaManual(req.uid, req.body, token);
    res.status(201).json({ message: "Alerta creada" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteVehiculo = async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    await service.deleteVehiculo(req.uid, req.params.placa, token);
    res.json({ message: "Vehículo eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createVehiculo, getVehiculos, createAlerta, deleteVehiculo };