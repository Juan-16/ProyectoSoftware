const express = require("express");
const admin = require("../firebaseAdmin");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();
const db = admin.firestore();

// 🔔 OBTENER ALERTAS ACTIVAS DEL USUARIO
router.get("/", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;

    const snapshot = await db.collection("alertas")
      .where("uid", "==", uid)
      .where("activa", "==", true)
      .get();

    const alertas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(alertas);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔥 ELIMINAR ALERTA
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("alertas").doc(id).delete();

    res.json({ message: "Alerta eliminada" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
