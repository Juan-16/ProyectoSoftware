const admin = require("../../firebaseAdmin");
const db = admin.firestore();

const { crearAlerta, deleteAlertasByVehiculo } = require("../Alertas/alertas.service.js");

// 🚗 crear vehículo + alertas
const createVehiculo = async (uid, data) => {
  const {
    marca,
    modelo,
    anoModelo,
    tipoVehiculo,
    placa,
    fechaSoat,
    fechaTecno,
  } = data;

  if (!placa) {
    throw new Error("La placa es requerida");
  }

  await db.collection("usuarios").doc(uid).set(
    {
      vehiculos: {
        [placa]: {
          marca,
          modelo,
          anoModelo,
          tipoVehiculo,
          fechaSoat,
          fechaTecno,
        },
      },
    },
    { merge: true }
  );

  // 🔔 CREAR ALERTAS (desde módulo alertas)
  const promesas = [];

  if (fechaSoat) {
    promesas.push(crearAlerta(uid, "SOAT", fechaSoat, placa));
  }

  if (fechaTecno) {
    promesas.push(crearAlerta(uid, "TECNOMECANICA", fechaTecno, placa));
  }

  await Promise.all(promesas);
};

// 📥 obtener vehículos
const getVehiculos = async (uid) => {
  const doc = await db.collection("usuarios").doc(uid).get();
  const data = doc.data();

  const vehiculosObj = data?.vehiculos || {};

  return Object.entries(vehiculosObj).map(([placa, info]) => ({
    placa,
    ...info,
  }));
};

// 🔔 crear alerta manual (usa alertas module)
const createAlertaManual = async (uid, data) => {
  const { tipo, fecha, placa } = data;

  if (!tipo || !fecha || !placa) {
    throw new Error("Faltan datos requeridos");
  }

  await crearAlerta(uid, tipo, fecha, placa);
};


const deleteVehiculo = async (uid, placa) => {
  // 1. eliminar vehículo
  await db.collection("usuarios").doc(uid).set(
    {
      vehiculos: {
        [placa]: admin.firestore.FieldValue.delete(),
      },
    },
    { merge: true }
  );

  // 2. eliminar alertas asociadas
  await deleteAlertasByVehiculo(uid, placa);
};

module.exports = {
  createVehiculo,
  getVehiculos,
  createAlertaManual,
  deleteVehiculo,
};