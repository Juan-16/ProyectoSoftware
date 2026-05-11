const admin = require("../../../firebaseAdmin");
const CrearAlertaInput = require("../../alertas/input/CrearAlertaInput");

const db = admin.firestore();

const CreateVehiculoInput = async (uid, data) => {
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
  if (fechaSoat) promesas.push(CrearAlertaInput(uid, "SOAT", fechaSoat, placa));
  if (fechaTecno) promesas.push(CrearAlertaInput(uid, "TECNOMECANICA", fechaTecno, placa));

  await Promise.all(promesas);
};

module.exports = CreateVehiculoInput;
