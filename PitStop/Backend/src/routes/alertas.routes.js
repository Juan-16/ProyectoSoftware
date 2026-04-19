const express = require("express");
const verifyToken = require("../../middlewares/verifyToken");
const controller = require("../controllers/alertas.controller");

const router = express.Router();

router.get("/", verifyToken, controller.getAlertas);
router.delete("/:id", verifyToken, controller.deleteAlerta);

// opcional (si quieres crear manualmente)
router.post("/", verifyToken, controller.createAlerta);

module.exports = router;