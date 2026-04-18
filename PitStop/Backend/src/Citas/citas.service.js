const admin = require("../../firebaseAdmin");
const db = admin.firestore();

// 🧠 helpers internos
const convertirAHoras = (hora) => {
  const [h, m] = hora.split(":").map(Number);
  return h + m / 60;
};

const formatoHora = (decimal) => {
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}`;
};

// 📅 GET HORARIOS DISPONIBLES
const getHorariosDisponibles = async (tallerId, fecha) => {
  const tallerDoc = await db.collection("talleres").doc(tallerId).get();

  if (!tallerDoc.exists) {
    throw new Error("Taller no encontrado");
  }

  const taller = tallerDoc.data();

  if (!taller?.horarios || !taller?.configuracionCitas) {
    return [];
  }

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

  // 🔥 citas existentes
  const snapshot = await db
    .collection("citas")
    .where("tallerId", "==", tallerId)
    .where("fecha", "==", fecha)
    .get();

  const citas = snapshot.docs.map((d) => d.data());

  return lista.map((hora) => {
    const usadas = citas.filter(
      (c) => c.hora === hora && c.estado !== "cancelada"
    ).length;

    return {
      hora,
      disponibles: Math.max(0, cupos - usadas),
    };
  });
};

// 📝 CREAR CITA
const crearCita = async (uid, data) => {
  const {
    tallerId,
    vehiculoId,
    servicio,
    comentario,
    fecha,
    hora,
  } = data;

  if (!tallerId || !vehiculoId || !fecha || !hora) {
    throw new Error("Faltan datos requeridos");
  }

  // 🔥 validar cupos
  const snapshot = await db
    .collection("citas")
    .where("tallerId", "==", tallerId)
    .where("fecha", "==", fecha)
    .where("hora", "==", hora)
    .get();

  const usadas = snapshot.docs.filter(
    (d) => d.data().estado !== "cancelada"
  ).length;

  const tallerDoc = await db.collection("talleres").doc(tallerId).get();
  const cupos = tallerDoc.data().configuracionCitas.cupos || 1;

  if (usadas >= cupos) {
    throw new Error("Cupo lleno");
  }

  await db.collection("citas").add({
    tallerId,
    usuarioId: uid,
    vehiculoId,
    servicio,
    comentario,
    fecha,
    hora,
    estado: "pendiente",
    creadaEn: new Date(),
  });
};

// 📄 OBTENER CITAS DEL USUARIO
const getCitasByUser = async (uid) => {
  const snapshot = await db
    .collection("citas")
    .where("usuarioId", "==", uid)
    .get();

  const citas = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // ordenar por fecha y hora
  citas.sort((a, b) => {
    if (a.fecha === b.fecha) return a.hora > b.hora ? 1 : -1;
    return a.fecha > b.fecha ? 1 : -1;
  });

  return citas;
};

// ❌ CANCELAR CITA
const cancelarCita = async (id, uid) => {
  const docRef = db.collection("citas").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) throw new Error("Cita no encontrada");

  const cita = docSnap.data();

  await docRef.update({
    estado: "cancelada",
  });
};

// 🗑 ELIMINAR CITA
const eliminarCita = async (id, uid) => {
  const docRef = db.collection("citas").doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) throw new Error("Cita no encontrada");

  const cita = docSnap.data();

  if (cita.usuarioId !== uid) {
    throw new Error("No autorizado");
  }

  await docRef.delete();
};

// 📅 citas del taller (próximos 7 días)
const getCitasTaller = async (tallerId) => {
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
        const userDoc = await db
          .collection("usuarios")
          .doc(data.usuarioId)
          .get();

        if (userDoc.exists) {
          usuarioNombre =
            userDoc.data()?.datosPersonales?.nombre || "Cliente";
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

  // ordenar
  citas.sort((a, b) => {
    if (a.fecha === b.fecha) return a.hora > b.hora ? 1 : -1;
    return a.fecha > b.fecha ? 1 : -1;
  });

  return citas;
};

// ✅ confirmar cita
const confirmarCita = async (citaId) => {
  await db.collection("citas").doc(citaId).update({
    estado: "confirmada",
  });
};

module.exports = {
  getHorariosDisponibles,
  crearCita,
  getCitasByUser,
  cancelarCita,
  eliminarCita,
  getCitasTaller,
  confirmarCita,
};