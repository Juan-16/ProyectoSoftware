const admin = require("../../firebaseAdmin");
const db = admin.firestore();

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


const getTalleresCercanos = async (lat, lng) => {
  const snapshot = await db.collection("talleres").get();

  const lista = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const datos = data.datosPersonales || {};

    if (datos.ubicacion?.lat && datos.ubicacion?.lng) {
      const dist = calcularDistancia(
        lat,
        lng,
        datos.ubicacion.lat,
        datos.ubicacion.lng
      );

      if (dist <= 100) {
        lista.push({
          id: doc.id,
          nombre: datos.nombre,
          direccion: datos.direccion,
          imageUrl: datos.imageUrl,
          distancia: dist,
        });
      }
    }
  });

  return lista;
};

module.exports = {
  getTalleresCercanos,
};

const createTaller = async (uid, data) => {
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

const getTallerInfo = async (uid) => {
  const doc = await db.collection("talleres").doc(uid).get();

  if (!doc.exists) throw new Error("Taller no encontrado");

  return doc.data();
};

const updateTaller = async (uid, data) => {
  const {
    nombre,
    telefono,
    direccion,
    imageUrl,
    domicilio,
    servicios,
    horarios,
  } = data;

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

const saveServicios = async (uid, data) => {
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

const getTallerById = async (id) => {
  const doc = await db.collection("talleres").doc(id).get();

  if (!doc.exists) throw new Error("Taller no encontrado");

  return {
    id: doc.id,
    ...doc.data(),
  };
};

const guardarConfiguracionCitas = async (tallerId, data) => {
  const { intervalo, cupos } = data;

  if (!intervalo || !cupos) {
    throw new Error("Faltan datos");
  }

  await db.collection("talleres").doc(tallerId).update({
    configuracionCitas: {
      intervalo,
      cupos,
    },
  });
};

module.exports = {
  createTaller,
  getTallerInfo,
  updateTaller,
  saveServicios,
  getTalleresCercanos,
  getTallerById,
  guardarConfiguracionCitas,
};