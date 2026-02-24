const express = require("express");
const admin = require("../firebaseAdmin");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();
const db = admin.firestore();

function crearAlerta(uid, tipo, fecha, placa) {
  return db.collection("alertas").add({
    uid,                 // dueño del vehículo
    tipo,                // "SOAT" o "TECNOMECANICA"
    fecha,               // "YYYY-MM-DD"
    placa,               // placa del vehículo

    activa: true,        // por si luego quieres desactivarla
    creadaEn: new Date(),

    // 👇 control de correos automáticos
    aviso7Enviado: false,
    aviso1Enviado: false,
  });
}

// 🔔 CREAR ALERTA MANUALMENTE
router.post("/alertas", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;
    const { tipo, fecha, placa } = req.body;

    if (!tipo || !fecha || !placa) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    // Llamamos a tu función interna
    await crearAlerta(uid, tipo, fecha, placa);

    res.status(201).json({ message: "Alerta creada exitosamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;
    const {
      marca,
      modelo,
      anoModelo,
      tipoVehiculo,
      placa,
      fechaSoat,
      fechaTecno,
    } = req.body;

    await db.collection("usuarios").doc(uid).set(
      {
        vehiculos: {
          [placa]: {
            marca,
            modelo,
            anoModelo,
            tipoVehiculo,
            fechaSoat,
            fechaTecno,
          },
        },
      },
      { merge: true }
    );

    // 🔥 CREAR ALERTAS AUTOMÁTICAS
    const promesas = [];

    if (fechaSoat) promesas.push(crearAlerta(uid, "SOAT", fechaSoat, placa));
    if (fechaTecno) promesas.push(crearAlerta(uid, "TECNOMECANICA", fechaTecno, placa));

    await Promise.all(promesas);

    res.json({ message: "Vehículo y alertas creadas" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:placa", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;
    const { placa } = req.params;

    await db.collection("usuarios").doc(uid).set(
      {
        vehiculos: {
          [placa]: admin.firestore.FieldValue.delete(),
        },
      },
      { merge: true }
    );

    res.json({ message: "Vehículo eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
