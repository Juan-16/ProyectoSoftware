const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const CreateTallerInput = async (uid, data) => {
  const { nombreTaller, telefonoTaller, direccion, lat, lng, horarios, imageUrl } = data;

  await db.collection("talleres").doc(uid).set(
    {
      tipo: "taller",
      datosPersonales: {
        nombre: nombreTaller,
        telefono: telefonoTaller,
        direccion,
        ubicacion: { lat, lng },
        imageUrl,
        creadoEn: new Date(),
      },
      horarios,
    },
    { merge: true }
  );
};

module.exports = CreateTallerInput;
