const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const DeleteAlertaInput = async (id) => {
  await db.collection("alertas").doc(id).delete();
};

module.exports = DeleteAlertaInput;
