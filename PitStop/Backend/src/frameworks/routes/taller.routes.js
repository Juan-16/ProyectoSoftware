const express = require("express");
const verifyToken = require("../../middlewares/verifyToken");
const controller = require("../controllers/taller.controller");

const router = express.Router();

router.post("/", verifyToken, controller.createTaller);
router.get("/", verifyToken, controller.getTallerInfo);
router.put("/", verifyToken, controller.updateTaller);
router.get("/cercanos", controller.getCercanos);
router.get("/:id", controller.getTallerById);
// ⚙️ configuración citas
router.patch("/configuracion-citas",verifyToken,controller.guardarConfiguracionCitas);

// 👇 este era tu segundo archivo separado
router.post("/servicios", verifyToken, controller.saveServicios);

module.exports = router;