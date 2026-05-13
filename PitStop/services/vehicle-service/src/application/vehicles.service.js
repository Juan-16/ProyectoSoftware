const admin = require("../infraestructure/firebaseAdmin");
const fetch = require("node-fetch");

const db = admin.firestore();

const ALERTAS_SERVICE_URL = process.env.ALERTAS_SERVICE_URL || "http://localhost:3005";

const crearAlertaRemota = async (token, tipo, fecha, placa) => {
  await fetch(`${ALERTAS_SERVICE_URL}/alertas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tipo, fecha, placa }),
  });
};

const createVehiculo = async (uid, data, token) => {
  const { marca, modelo, anoModelo, tipoVehiculo, placa, fechaSoat, fechaTecno } = data;

  if (!placa) throw new Error("La placa es requerida");

  await db.collection("usuarios").doc(uid).set(
    {
      vehiculos: {
        [placa]: { marca, modelo, anoModelo, tipoVehiculo, fechaSoat, fechaTecno },
      },
    },
    { merge: true }
  );

  const promesas = [];
  if (fechaSoat) promesas.push(crearAlertaRemota(token, "SOAT", fechaSoat, placa));
  if (fechaTecno) promesas.push(crearAlertaRemota(token, "TECNOMECANICA", fechaTecno, placa));
  await Promise.all(promesas);
};

const getVehiculos = async (uid) => {
  const doc = await db.collection("usuarios").doc(uid).get();
  const vehiculosObj = doc.data()?.vehiculos || {};
  return Object.entries(vehiculosObj).map(([placa, info]) => ({ placa, ...info }));
};

const createAlertaManual = async (uid, data, token) => {
  const { tipo, fecha, placa } = data;
  if (!tipo || !fecha || !placa) throw new Error("Faltan datos requeridos");
  await crearAlertaRemota(token, tipo, fecha, placa);
};

const deleteVehiculo = async (uid, placa, token) => {
  await db.collection("usuarios").doc(uid).set(
    { vehiculos: { [placa]: admin.firestore.FieldValue.delete() } },
    { merge: true }
  );

  const res = await fetch(`${ALERTAS_SERVICE_URL}/alertas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const alertas = await res.json();
  const alertasDelVehiculo = (alertas || []).filter((a) => a.placa === placa);

  await Promise.all(
    alertasDelVehiculo.map((a) =>
      fetch(`${ALERTAS_SERVICE_URL}/alertas/${a.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
    )
  );
};

module.exports = { createVehiculo, getVehiculos, createAlertaManual, deleteVehiculo };