const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const UpdatePersonaInput = async (uid, data) => {
  const { nombre, telefono, direccion, lat, lng, fechaNacimiento, imageUrl } = data;

  await db.collection("usuarios").doc(uid).set(
    {
      tipo: "persona",
      datosPersonales: {
        nombre,
        telefono,
        direccion,
        ubicacion: {
          lat: lat || null,
          lng: lng || null,
        },
        fechaNacimiento: fechaNacimiento || null,
        imageUrl: imageUrl || null,
        actualizadoEn: new Date(),
      },
    },
    { merge: true }
  );
};

module.exports = UpdatePersonaInput;
