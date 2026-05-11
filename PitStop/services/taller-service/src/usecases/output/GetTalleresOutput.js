const admin = require("../../../firebaseAdmin");

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

const GetTalleresOutput = async (lat, lng) => {
  const snapshot = await db.collection("talleres").get();
  const lista = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const datos = data.datosPersonales || {};

    if (datos.ubicacion?.lat && datos.ubicacion?.lng) {
      const dist = calcularDistancia(lat, lng, datos.ubicacion.lat, datos.ubicacion.lng);

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

module.exports = GetTalleresOutput;
