const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const EliminarCitaInput = async (id, uid) => {
  const docRef = db.collection("citas").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) throw new Error("Cita no encontrada");

  const cita = docSnap.data();

  if (cita.usuarioId !== uid) {
    throw new Error("No autorizado");
  }

  await docRef.delete();
};

module.exports = EliminarCitaInput;
