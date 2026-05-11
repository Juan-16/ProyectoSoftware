const express = require("express");
const cors = require("cors");
require("dotenv").config();

const personaRoutes = require("./src/persona.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Persona Service funcionando 👤"));

app.use("/persona", personaRoutes);

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use((err, req, res, next) => res.status(500).json({ error: "Error interno" }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Persona Service corriendo en puerto ${PORT}`));

module.exports = app;