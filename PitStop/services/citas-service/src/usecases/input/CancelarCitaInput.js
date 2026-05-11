const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const CancelarCitaInput = async (id) => {
  const docRef = db.collection("citas").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) throw new Error("Cita no encontrada");

  await docRef.update({ estado: "cancelada" });
};

module.exports = CancelarCitaInput;
