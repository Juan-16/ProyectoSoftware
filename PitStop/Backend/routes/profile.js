const express = require("express");
const admin = require("../firebaseAdmin");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();
const db = admin.firestore();


router.post("/persona", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;

    const { nombre, telefono, direccion, lat, lng, fechaNacimiento, imageUrl } = req.body;

    await db.collection("usuarios").doc(uid).set(
      {
        tipo: "persona",
        datosPersonales: {
          nombre,
          telefono,
          direccion,
          ubicacion: {
            lat,
            lng,
          },
          fechaNacimiento,
          imageUrl,
          creadoEn: new Date(),
        },
      },
      { merge: true }
    );

    res.json({ message: "Perfil persona guardado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🛠 PERFIL TALLER
router.post("/taller", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;

    const { nombreTaller, telefonoTaller, direccion, lat, lng, horarios, imageUrl } = req.body;

    await db.collection("talleres").doc(uid).set(
      {
        tipo: "taller",
        datosPersonales: {
          nombre: nombreTaller,
          telefono: telefonoTaller,
          direccion,
          ubicacion: {
            lat,
            lng,
          },
          imageUrl,
          creadoEn: new Date(),
        },
        horarios,
      },
      { merge: true }
    );

    res.json({ message: "Perfil taller guardado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;

    // Buscar si es PERSONA
    const personaDoc = await db.collection("usuarios").doc(uid).get();
    if (personaDoc.exists) {
      return res.json({ uid, tipo: "persona", ...personaDoc.data() });
    }

    // Buscar si es TALLER
    const tallerDoc = await db.collection("talleres").doc(uid).get();
    if (tallerDoc.exists) {
      return res.json({ uid, tipo: "taller", ...tallerDoc.data() });
    }

    // Si no tiene perfil aún
    return res.json({ uid, tipo: null });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/vehiculos", verifyToken, async (req, res) => {
  try {
    console.log("UID DEL TOKEN:", req.uid);  

    const uid = req.uid;

    const doc = await db.collection("usuarios").doc(uid).get();

    console.log("DOC EXISTE:", doc.exists); 

    const data = doc.data();
    console.log("DATA:", data); 

    const vehiculosObj = data?.vehiculos || {};

    const vehiculos = Object.entries(vehiculosObj).map(([placa, info]) => ({
      placa,
      ...info,
    }));

    res.json(vehiculos);

  } catch (error) {
    console.error("Error trayendo vehículos:", error);
    res.status(500).json({ error: "Error obteniendo vehículos" });
  }
});


router.get("/tallerInfo", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;

    const doc = await db.collection("talleres").doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Taller no encontrado" });
    }

    res.json(doc.data());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.put("/taller", verifyToken, async (req, res) => {
  try {
    const uid = req.uid;

    const {
      nombre,
      telefono,
      direccion,
      imageUrl,
      domicilio,
      servicios,
      horarios,
    } = req.body;

    await db.collection("talleres").doc(uid).set(
      {
        datosPersonales: {
          nombre,
          telefono,
          direccion,
          imageUrl,
          domicilio,
          actualizadoEn: new Date(),
        },
        servicios: servicios || [],
        horarios: horarios || [],
      },
      { merge: true }
    );

    res.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
