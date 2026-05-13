const admin = require("../../frameworks/firebaseAdmin");
const DeleteAlertasByVehiculoInput = require("../../../../alertas-service/src/usecases/input/DeleteAlertasByVehiculoInput");

const db = admin.firestore();

const DeleteVehiculoInput = async (uid, placa) => {
  await db.collection("usuarios").doc(uid).set(
    {
      vehiculos: {
        [placa]: admin.firestore.FieldValue.delete(),
      },
    },
    { merge: true }
  );

  await DeleteAlertasByVehiculoInput(uid, placa);
};

module.exports = DeleteVehiculoInput;
