const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const GetCitasTallerOutput = async (tallerId) => {
  const snapshot = await db
    .collection("citas")
    .where("tallerId", "==", tallerId)
    .get();

  const hoy = new Date();
  const semana = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(hoy.getDate() + i);
    return d.toLocaleDateString("sv-SE");
  });

  const citas = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    if (!semana.includes(data.fecha)) continue;

    let usuarioNombre = "Cliente";

    try {
      if (data.usuarioId) {
        const userDoc = await db.collection("usuarios").doc(data.usuarioId).get();
        if (userDoc.exists) {
          usuarioNombre = userDoc.data()?.datosPersonales?.nombre || "Cliente";
        }
      }
    } catch {
      usuarioNombre = "Cliente";
    }

    citas.push({
      id: docSnap.id,
      usuarioNombre,
      vehiculoId: data.vehiculoId || "",
      fecha: data.fecha || "",
      hora: data.hora || "",
      servicio: data.servicio || "",
      estado: data.estado || "pendiente",
    });
  }

  citas.sort((a, b) => {
    if (a.fecha === b.fecha) return a.hora > b.hora ? 1 : -1;
    return a.fecha > b.fecha ? 1 : -1;
  });

  return citas;
};

module.exports = GetCitasTallerOutput;
