const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const ConfigCitasInput = async (tallerId, data) => {
  const { intervalo, cupos } = data;

  if (!intervalo || !cupos) {
    throw new Error("Faltan datos");
  }

  await db.collection("talleres").doc(tallerId).update({
    configuracionCitas: { intervalo, cupos },
  });
};

module.exports = ConfigCitasInput;
