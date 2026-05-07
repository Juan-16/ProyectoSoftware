const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const CreatePersonaInput = async (uid, data) => {
  const { nombre, telefono, direccion, lat, lng, fechaNacimiento, imageUrl } = data;

  await db.collection("usuarios").doc(uid).set(
    {
      tipo: "persona",
      datosPersonales: {
        nombre,
        telefono,
        direccion,
        ubicacion: { lat, lng },
        fechaNacimiento,
        imageUrl,
        creadoEn: new Date(),
      },
    },
    { merge: true }
  );
};

module.exports = CreatePersonaInput;
