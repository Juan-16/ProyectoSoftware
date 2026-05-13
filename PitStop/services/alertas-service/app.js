const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const alertasRoutes = require("./src/routes/alertas.routes");
const admin = require("./src/infrastructure/firebaseAdmin");
const { enviarCorreo } = require("./shared/services/mailer");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Alertas Service funcionando 🔔"));

app.use("/alertas", alertasRoutes);

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use((err, req, res, next) => res.status(500).json({ error: "Error interno" }));

// ⏰ CRON: revisa alertas todos los días a las 8am
cron.schedule("0 8 * * *", async () => {
  console.log("Revisando alertas...");
  const db = admin.firestore();
  const snapshot = await db.collection("alertas").where("activa", "==", true).get();
  const hoy = new Date();

  for (const doc of snapshot.docs) {
    const alerta = doc.data();
    const alertaRef = doc.ref;
    const fechaVenc = new Date(alerta.fecha);
    const diffDias = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));

    try {
      const userRecord = await admin.auth().getUser(alerta.uid);
      const email = userRecord.email;
      const asunto = `⚠️ Tu ${alerta.tipo} está por vencer`;
      const mensaje = `
        <h2>Recordatorio de ${alerta.tipo}</h2>
        <p>Placa: <b>${alerta.placa}</b></p>
        <p>Vence el: <b>${alerta.fecha}</b></p>
      `;

      if (diffDias === 7 && !alerta.aviso7Enviado) {
        await enviarCorreo(email, asunto, mensaje);
        await alertaRef.update({ aviso7Enviado: true });
      }

      if (diffDias === 1 && !alerta.aviso1Enviado) {
        await enviarCorreo(email, asunto, mensaje);
        await alertaRef.update({ aviso1Enviado: true });
      }
    } catch (e) {
      console.error("Error procesando alerta:", e.message);
    }
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Alertas Service corriendo en puerto ${PORT}`));

module.exports = app;