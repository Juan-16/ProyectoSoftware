const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const controller = require("./alertas.controller");

const router = express.Router();

router.get("/", verifyToken, controller.getAlertas);
router.delete("/:id", verifyToken, controller.deleteAlerta);
router.post("/", verifyToken, controller.createAlerta);

module.exports = router;