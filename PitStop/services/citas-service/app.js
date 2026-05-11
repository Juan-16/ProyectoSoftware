const express = require("express");
const cors = require("cors");
require("dotenv").config();

const citasRoutes = require("./src/citas.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Citas Service funcionando 📅"));

app.use("/citas", citasRoutes);

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use((err, req, res, next) => res.status(500).json({ error: "Error interno" }));

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`Citas Service corriendo en puerto ${PORT}`));

module.exports = app;