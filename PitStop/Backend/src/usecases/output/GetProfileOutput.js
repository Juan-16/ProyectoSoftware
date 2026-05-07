const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const GetProfileOutput = async (uid) => {
  const doc = await db.collection("usuarios").doc(uid).get();

  if (!doc.exists) return null;

  return { uid, tipo: "persona", ...doc.data() };
};

module.exports = GetProfileOutput;
