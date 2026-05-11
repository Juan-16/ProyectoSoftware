const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const DeleteAlertasByVehiculoInput = async (uid, placa) => {
  const snapshot = await db
    .collection("alertas")
    .where("uid", "==", uid)
    .where("placa", "==", placa)
    .get();

  const batch = db.batch();
  snapshot.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
};

module.exports = DeleteAlertasByVehiculoInput;
