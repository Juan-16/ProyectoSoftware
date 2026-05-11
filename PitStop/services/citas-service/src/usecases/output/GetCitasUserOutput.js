const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const GetCitasUserOutput = async (uid) => {
  const snapshot = await db
    .collection("citas")
    .where("usuarioId", "==", uid)
    .get();

  const citas = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  citas.sort((a, b) => {
    if (a.fecha === b.fecha) return a.hora > b.hora ? 1 : -1;
    return a.fecha > b.fecha ? 1 : -1;
  });

  return citas;
};

module.exports = GetCitasUserOutput;
