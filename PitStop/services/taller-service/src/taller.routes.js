const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const controller = require("./taller.controller");

const router = express.Router();

router.post("/", verifyToken, controller.createTaller);
router.get("/", verifyToken, controller.getTallerInfo);
router.put("/", verifyToken, controller.updateTaller);
router.get("/cercanos", controller.getCercanos);
router.get("/:id", controller.getTallerById);
router.patch("/configuracion-citas", verifyToken, controller.guardarConfiguracionCitas);
router.post("/servicios", verifyToken, controller.saveServicios);

module.exports = router;