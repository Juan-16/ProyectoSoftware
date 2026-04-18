const express = require("express");
const cors = require("cors");
require("dotenv").config();

// 📦 IMPORTAR RUTAS
const personaRoutes = require("./src/persona/persona.routes");
const tallerRoutes = require("./src/taller/taller.routes");
const vehiculosRoutes = require("./src/vehicles/vehicles.routes");
const alertasRoutes = require("./src/alertas/alertas.routes");
const authRoutes = require("./src/auth/auth.routes");
const citasRoutes = require("./src/citas/citas.routes");

const app = express();

// 🔧 MIDDLEWARES
app.use(cors());
app.use(express.json());

// 🩺 TEST
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// 🔌 RUTAS
app.use("/persona", personaRoutes);
app.use("/taller", tallerRoutes);
app.use("/vehiculos", vehiculosRoutes);
app.use("/alertas", alertasRoutes);
app.use("/citas", citasRoutes);
app.use("/auth", authRoutes);

// ❌ 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// 💥 errores
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

module.exports = app;