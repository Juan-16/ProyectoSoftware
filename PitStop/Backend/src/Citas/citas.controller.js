const service = require("./citas.service");

// 📅 GET horarios
const getDisponibles = async (req, res) => {
  try {
    const { tallerId, fecha } = req.query;

    if (!tallerId || !fecha) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    const data = await service.getHorariosDisponibles(
      tallerId,
      fecha
    );

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📝 POST crear cita
const crearCita = async (req, res) => {
  try {
    await service.crearCita(req.uid, req.body);

    res.status(201).json({ message: "Cita creada" });
  } catch (error) {
    if (error.message === "Cupo lleno") {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
};

// 📄 GET mis citas
const getMisCitas = async (req, res) => {
  try {
    const data = await service.getCitasByUser(req.uid);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ PUT cancelar
const cancelar = async (req, res) => {
  try {
    await service.cancelarCita(req.params.id, req.uid);
    res.json({ message: "Cita cancelada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🗑 DELETE eliminar
const eliminar = async (req, res) => {
  try {
    await service.eliminarCita(req.params.id, req.uid);
    res.json({ message: "Cita eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📅 GET citas del taller
const getCitasTaller = async (req, res) => {
  try {
    const data = await service.getCitasTaller(req.uid);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ confirmar cita
const confirmarCita = async (req, res) => {
  try {
    const { id } = req.params;

    await service.confirmarCita(id);

    res.json({ message: "Cita confirmada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDisponibles,
  crearCita,
  getMisCitas,
  cancelar,
  eliminar,
  getCitasTaller,
  confirmarCita,
};