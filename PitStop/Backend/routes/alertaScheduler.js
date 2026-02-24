const admin = require("../firebaseAdmin");
const { enviarCorreo } = require("./mailer");
const cron = require("node-cron");

const db = admin.firestore();

cron.schedule("0 8 * * *", async () => {
  console.log("Revisando alertas...");

  const snapshot = await db.collection("alertas").where("activa", "==", true).get();

  const hoy = new Date();

  for (const doc of snapshot.docs) {
    const alerta = doc.data();
    const alertaRef = doc.ref;

    const fechaVenc = new Date(alerta.fecha);
    const diffDias = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));

    const userRecord = await admin.auth().getUser(alerta.uid);
    const email = userRecord.email;

    console.log("EMAIL DESTINO:", email);

    const asunto = `⚠️ Tu ${alerta.tipo} está por vencer`;
    const mensaje = `
      <h2>Recordatorio de ${alerta.tipo}</h2>
      <p>Placa: <b>${alerta.placa}</b></p>
      <p>Vence el: <b>${alerta.fecha}</b></p>
    `;

    // 7 días antes
    if (diffDias === 7 && !alerta.aviso7Enviado) {
      await enviarCorreo(email, asunto, mensaje);
      await alertaRef.update({ aviso7Enviado: true });
    }

    // 1 día antes
    if (diffDias === 1 && !alerta.aviso1Enviado) {
      await enviarCorreo(email, asunto, mensaje);
      await alertaRef.update({ aviso1Enviado: true });
    }
  }
});
