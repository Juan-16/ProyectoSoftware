const admin = require("../../firebaseAdmin");
const db = admin.firestore();

// 🔔 CREAR ALERTA
const crearAlerta = async (uid, tipo, fecha, placa) => {
  return db.collection("alertas").add({
    uid,
    tipo,
    fecha,
    placa,
    activa: true,
    creadaEn: new Date(),
    aviso7Enviado: false,
    aviso1Enviado: false,
  });
};

// 📥 OBTENER ALERTAS ACTIVAS
const getAlertas = async (uid) => {
  const snapshot = await db
    .collection("alertas")
    .where("uid", "==", uid)
    .where("activa", "==", true)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// ❌ ELIMINAR ALERTA
const deleteAlerta = async (id) => {
  await db.collection("alertas").doc(id).delete();
};

const deleteAlertasByVehiculo = async (uid, placa) => {
  const snapshot = await db
    .collection("alertas")
    .where("uid", "==", uid)
    .where("placa", "==", placa)
    .get();

  const batch = db.batch();

  snapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

module.exports = {
  crearAlerta,
  getAlertas,
  deleteAlerta,
  deleteAlertasByVehiculo,
};