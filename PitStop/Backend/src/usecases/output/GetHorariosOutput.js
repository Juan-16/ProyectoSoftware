const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const convertirAHoras = (hora) => {
  const [h, m] = hora.split(":").map(Number);
  return h + m / 60;
};

const formatoHora = (decimal) => {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

const GetHorariosOutput = async (tallerId, fecha) => {
  const tallerDoc = await db.collection("talleres").doc(tallerId).get();

  if (!tallerDoc.exists) throw new Error("Taller no encontrado");

  const taller = tallerDoc.data();

  if (!taller?.horarios || !taller?.configuracionCitas) return [];

  const fechaObj = new Date(fecha);
  const diaSemana = (fechaObj.getDay() + 6) % 7;
  const horarioDia = taller.horarios[diaSemana];

  if (!horarioDia?.activo) return [];

  const inicio = convertirAHoras(horarioDia.inicio);
  const fin = convertirAHoras(horarioDia.fin);
  const intervalo = taller.configuracionCitas.intervalo || 30;
  const cupos = taller.configuracionCitas.cupos || 1;

  const lista = [];
  let horaActual = inicio;

  while (horaActual < fin) {
    lista.push(formatoHora(horaActual));
    horaActual += intervalo / 60;
  }

  const snapshot = await db
    .collection("citas")
    .where("tallerId", "==", tallerId)
    .where("fecha", "==", fecha)
    .get();

  const citas = snapshot.docs.map((d) => d.data());

  return lista.map((hora) => {
    const usadas = citas.filter((c) => c.hora === hora && c.estado !== "cancelada").length;
    return { hora, disponibles: Math.max(0, cupos - usadas) };
  });
};

module.exports = GetHorariosOutput;
