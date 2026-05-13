const express = require("express");
const cors = require("cors");
require("dotenv").config();

const vehiculosRoutes = require("./src/routes/vehicles.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Vehicles Service funcionando 🚗"));

app.use("/vehiculos", vehiculosRoutes);

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use((err, req, res, next) => res.status(500).json({ error: "Error interno" }));

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Vehicles Service corriendo en puerto ${PORT}`));

module.exports = app;