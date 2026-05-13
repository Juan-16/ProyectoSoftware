const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/auth.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Auth Service funcionando 🔐"));

app.use("/auth", authRoutes);

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use((err, req, res, next) => res.status(500).json({ error: "Error interno" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Auth Service corriendo en puerto ${PORT}`));

module.exports = app;