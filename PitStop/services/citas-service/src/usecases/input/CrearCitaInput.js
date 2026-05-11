const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const CrearCitaInput = async (uid, data) => {
  const { tallerId, vehiculoId, servicio, comentario, fecha, hora } = data;

  if (!tallerId || !vehiculoId || !fecha || !hora) {
    throw new Error("Faltan datos requeridos");
  }

  const snapshot = await db
    .collection("citas")
    .where("tallerId", "==", tallerId)
    .where("fecha", "==", fecha)
    .where("hora", "==", hora)
    .get();

  const usadas = snapshot.docs.filter((d) => d.data().estado !== "cancelada").length;

  const tallerDoc = await db.collection("talleres").doc(tallerId).get();
  const cupos = tallerDoc.data().configuracionCitas.cupos || 1;

  if (usadas >= cupos) {
    throw new Error("Cupo lleno");
  }

  await db.collection("citas").add({
    tallerId,
    usuarioId: uid,
    vehiculoId,
    servicio,
    comentario,
    fecha,
    hora,
    estado: "pendiente",
    creadaEn: new Date(),
  });
};

module.exports = CrearCitaInput;
