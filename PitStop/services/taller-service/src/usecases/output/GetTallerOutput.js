const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

// Obtener taller del uid autenticado (perfil propio)
const GetTallerOutput = async (uid) => {
  const doc = await db.collection("talleres").doc(uid).get();

  if (!doc.exists) throw new Error("Taller no encontrado");

  return doc.data();
};

// Obtener taller por id público
const GetTallerByIdOutput = async (id) => {
  const doc = await db.collection("talleres").doc(id).get();

  if (!doc.exists) throw new Error("Taller no encontrado");

  return { id: doc.id, ...doc.data() };
};

module.exports = { GetTallerOutput, GetTallerByIdOutput };
