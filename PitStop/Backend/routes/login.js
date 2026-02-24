const express = require("express");
const fetch = require("node-fetch");
const admin = require("../firebaseAdmin"); // 🔥 IMPORTANTE
const { sendPasswordResetEmail } = require("./emailService");

const router = express.Router();
const db = admin.firestore();

const loginAttempts = {};

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    const intentos = loginAttempts[email] || 0;
    if (intentos >= 3) {
      return res.status(403).json({
        message: "Cuenta bloqueada. Revisa tu correo para restablecer contraseña.",
      });
    }

    // 🔐 LOGIN CON FIREBASE AUTH
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();
    console.log("API KEY:", process.env.FIREBASE_API_KEY);
    console.log("Firebase login response:", data);

    if (data.error) {
      loginAttempts[email] = intentos + 1;

      if (loginAttempts[email] >= 3) {
        await sendPasswordResetEmail(email);
      }

      return res.status(401).json({ message: "Email o contraseña incorrecta" });
    }

    loginAttempts[email] = 0;

    const uid = data.localId;

    // 🔥 AQUI MIRAMOS EL TIPO DE USUARIO
    let tipo = null;

    const personaDoc = await db.collection("usuarios").doc(uid).get();
    if (personaDoc.exists) {
      tipo = "persona";
    }

    const tallerDoc = await db.collection("talleres").doc(uid).get();
    if (tallerDoc.exists) {
      tipo = "taller";
    }

    return res.json({
      message: "Login exitoso",
      uid,
      tipo, // 👈 ESTO ES LO IMPORTANTE
      idToken: data.idToken,
      refreshToken: data.refreshToken,
    });
    

  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

module.exports = router;
