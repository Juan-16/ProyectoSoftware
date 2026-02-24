const express = require("express");
const admin = require("../firebaseAdmin");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });

    res.status(201).json({
      message: "Usuario creado",
      uid: user.uid,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// 🔐 OLVIDE CONTRASEÑA
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requerido" });
    }

    const link = await admin.auth().generatePasswordResetLink(email);

    // aquí puedes enviarlo con tu mailer
    const { enviarCorreo } = require("../utils/mailer");

    await enviarCorreo(
      email,
      "Restablecer contraseña",
      `<p>Haz clic aquí para restablecer tu contraseña:</p>
       <a href="${link}">${link}</a>`
    );

    res.json({ message: "Correo enviado" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
