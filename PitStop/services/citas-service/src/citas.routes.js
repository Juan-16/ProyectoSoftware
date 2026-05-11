const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const controller = require("./citas.controller");

const router = express.Router();

router.get("/disponibles", controller.getDisponibles);
router.post("/", verifyToken, controller.crearCita);
router.get("/", verifyToken, controller.getMisCitas);
router.put("/:id/cancelar", verifyToken, controller.cancelar);
router.delete("/:id", verifyToken, controller.eliminar);
router.get("/taller", verifyToken, controller.getCitasTaller);
router.patch("/:id/confirmar", verifyToken, controller.confirmarCita);

module.exports = router;