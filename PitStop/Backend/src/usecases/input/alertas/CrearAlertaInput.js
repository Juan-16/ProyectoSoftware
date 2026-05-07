const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const CrearAlertaInput = async (uid, tipo, fecha, placa) => {
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

module.exports = CrearAlertaInput;
