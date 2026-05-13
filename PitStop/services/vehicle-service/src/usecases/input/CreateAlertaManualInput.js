const CrearAlertaInput = require("../../alertas/input/CrearAlertaInput");
const CrearAlertaInput = require("../../../../alertas-service/src/usecases/input/CrearAlertaInput");

const CreateAlertaManualInput = async (uid, data) => {
  const { tipo, fecha, placa } = data;

  if (!tipo || !fecha || !placa) {
    throw new Error("Faltan datos requeridos");
  }

  await CrearAlertaInput(uid, tipo, fecha, placa);
};

module.exports = CreateAlertaManualInput;
