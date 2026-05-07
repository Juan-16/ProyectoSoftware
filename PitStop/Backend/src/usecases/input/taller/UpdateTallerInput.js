const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const UpdateTallerInput = async (uid, data) => {
  const { nombre, telefono, direccion, imageUrl, domicilio, servicios, horarios } = data;

  await db.collection("talleres").doc(uid).set(
    {
      datosPersonales: {
        nombre,
        telefono,
        direccion,
        imageUrl,
        domicilio,
        actualizadoEn: new Date(),
      },
      servicios: servicios || [],
      horarios: horarios || [],
    },
    { merge: true }
  );
};

module.exports = UpdateTallerInput;
