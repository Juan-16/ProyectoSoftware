const express = require("express");
const admin = require("../firebaseAdmin");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();
const db = admin.firestore();

// Ruta para guardar servicios del taller
router.post("/", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;
    const { servicios, domicilio } = req.body;

    if (!servicios || servicios.length === 0) {
      return res.status(400).json({ error: "Debes seleccionar al menos un servicio" });
    }

    await db.collection("talleres").doc(uid).set(
      {
        tipo: "taller",
        datosPersonales: {
          domicilio,
          actualizadoEn: new Date(),
        },
        servicios,
      },
      { merge: true }
    );

    res.json({ message: "Servicios del taller guardados correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error guardando los servicios del taller" });
  }
});


module.exports = router;
