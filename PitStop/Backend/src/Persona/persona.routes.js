const express = require("express");
const verifyToken = require("../../middlewares/verifyToken");
const controller = require("./persona.controller");

const router = express.Router();

router.post("/", verifyToken, controller.createPersona);
router.get("/me", verifyToken, controller.getMe);
router.put("/update", verifyToken, controller.updatePersonaController);


module.exports = router;