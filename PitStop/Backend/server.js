const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./routes/alertaScheduler.js");

const app = express();

app.use(cors());
app.use(express.json());
// Rutas
app.use("/auth", require("./routes/auth"));

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
app.use("/profile", require("./routes/profile"));
const vehiclesRoutes = require("./routes/vehicles");
app.use("/vehicles", vehiclesRoutes);
const talleresRoutes = require("./routes/talleres");
app.use("/talleres", talleresRoutes);
const loginRouter = require("./routes/login");
app.use("/login", loginRouter); 
const alertasRoutes = require("./routes/alertas");
app.use("/alertas", alertasRoutes);


