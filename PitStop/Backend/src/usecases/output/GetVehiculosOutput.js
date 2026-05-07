const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const GetVehiculosOutput = async (uid) => {
  const doc = await db.collection("usuarios").doc(uid).get();
  const data = doc.data();

  const vehiculosObj = data?.vehiculos || {};

  return Object.entries(vehiculosObj).map(([placa, info]) => ({
    placa,
    ...info,
  }));
};

module.exports = GetVehiculosOutput;
