const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const ConfirmarCitaInput = async (citaId) => {
  await db.collection("citas").doc(citaId).update({ estado: "confirmada" });
};

module.exports = ConfirmarCitaInput;
