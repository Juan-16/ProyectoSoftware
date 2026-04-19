const admin = require("../../firebaseAdmin");
const db = admin.firestore();

const createPersona = async (uid, data) => {
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


const getProfile = async (uid) => {
  const doc = await db.collection("usuarios").doc(uid).get();

  if (!doc.exists) return null;

  return { uid, tipo: "persona", ...doc.data() };
};

const updatePersona = async (uid, data) => {
  const {
    nombre,
    telefono,
    direccion,
    lat,
    lng,
    fechaNacimiento,
    imageUrl,
  } = data;

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

module.exports = {
  createPersona,
  getProfile,
  updatePersona,
};