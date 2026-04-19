const express = require("express");
const controller = require("../controllers/citas.controller");
const verifyToken = require("../../middlewares/verifyToken");

const router = express.Router();

// 📅 horarios disponibles
router.get("/disponibles", controller.getDisponibles);

// 📝 crear cita
router.post("/", verifyToken, controller.crearCita);

// 📄 mis citas
router.get("/", verifyToken, controller.getMisCitas);

// ❌ cancelar cita
router.put("/:id/cancelar", verifyToken, controller.cancelar);

// 🗑 eliminar cita
router.delete("/:id", verifyToken, controller.eliminar);

// 🔧 citas del taller
router.get("/taller", verifyToken, controller.getCitasTaller);

// ✅ confirmar cita
router.patch("/:id/confirmar", verifyToken, controller.confirmarCita);

module.exports = router;