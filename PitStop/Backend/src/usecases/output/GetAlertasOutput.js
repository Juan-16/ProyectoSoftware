const admin = require("../../../firebaseAdmin");

const db = admin.firestore();

const GetAlertasOutput = async (uid) => {
  const snapshot = await db
    .collection("alertas")
    .where("uid", "==", uid)
    .where("activa", "==", true)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

module.exports = GetAlertasOutput;
