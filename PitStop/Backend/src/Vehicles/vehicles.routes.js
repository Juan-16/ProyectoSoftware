const express = require("express");
const verifyToken = require("../../middlewares/verifyToken");
const controller = require("./vehicles.controller");

const router = express.Router();

router.get("/", verifyToken, controller.getVehiculos);
router.post("/", verifyToken, controller.createVehiculo);
router.delete("/:placa", verifyToken, controller.deleteVehiculo);
router.post("/alertas", verifyToken, controller.createAlerta);

module.exports = router;