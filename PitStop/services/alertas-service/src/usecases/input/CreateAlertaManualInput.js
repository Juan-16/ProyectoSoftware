const CrearAlertaInput = require("../input/CrearAlertaInput");

const CreateAlertaManualInput = async (uid, data) => {
  const { tipo, fecha, placa } = data;

  if (!tipo || !fecha || !placa) {
    throw new Error("Faltan datos requeridos");
  }

  await CrearAlertaInput(uid, tipo, fecha, placa);
};

module.exports = CreateAlertaManualInput;
