const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const SaveServiciosInput = async (uid, data) => {
  const { servicios, domicilio } = data;

  if (!servicios || servicios.length === 0) {
    throw new Error("Debes seleccionar al menos un servicio");
  }

  await db.collection("talleres").doc(uid).set(
    {
      tipo: "taller",
      datosPersonales: {
        domicilio,
        actualizadoEn: new Date(),
      },
      servicios,
    },
    { merge: true }
  );
};

module.exports = SaveServiciosInput;
