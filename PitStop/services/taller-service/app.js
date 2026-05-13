const express = require("express");
const cors = require("cors");
require("dotenv").config();

const tallerRoutes = require("./src/routes/taller.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Taller Service funcionando 🔧"));

app.use("/taller", tallerRoutes);

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use((err, req, res, next) => res.status(500).json({ error: "Error interno" }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Taller Service corriendo en puerto ${PORT}`));

module.exports = app;