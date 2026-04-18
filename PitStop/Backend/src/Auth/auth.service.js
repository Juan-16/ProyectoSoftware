
const fetch = require("node-fetch");
const admin = require("../../firebaseAdmin");
const { enviarCorreo } = require("../../shared/services/emailService");

const db = admin.firestore();

const loginAttempts = {};

// 🔐 LOGIN
const login = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email y contraseña son requeridos");
  }

  const intentos = loginAttempts[email] || 0;

  if (intentos >= 3) {
    throw new Error("Cuenta bloqueada. Revisa tu correo para restablecer contraseña.");
  }

  console.log("API KEY REAL:", process.env.FIREBASE_API_KEY);

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  const data = await response.json();

  if (data.error) {
    loginAttempts[email] = intentos + 1;

    if (loginAttempts[email] >= 3) {
      await sendPasswordReset(email);
    }

    throw new Error("Email o contraseña incorrecta");
  }

  loginAttempts[email] = 0;

  const uid = data.localId;

  let tipo = null;

  const personaDoc = await db.collection("usuarios").doc(uid).get();
  if (personaDoc.exists) tipo = "persona";

  const tallerDoc = await db.collection("talleres").doc(uid).get();
  if (tallerDoc.exists) tipo = "taller";

  return {
    message: "Login exitoso",
    uid,
    tipo,
    idToken: data.idToken,
    refreshToken: data.refreshToken,
  };
};

const register = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email y contraseña requeridos");
  }

  const user = await admin.auth().createUser({
    email,
    password,
  });

  // 🔥 crear perfil automáticamente
  await db.collection("usuarios").doc(user.uid).set({
    email,
    creadoEn: new Date(),
    datosPersonales: {},
    vehiculos: {},
  });

  return {
    message: "Usuario creado",
    uid: user.uid,
  };
};

// 🆕 FORGOT PASSWORD
const sendPasswordReset = async (email) => {
  if (!email) {
    throw new Error("Email requerido");
  }

  const link = await admin.auth().generatePasswordResetLink(email);

  await enviarCorreo(
    email,
    "Restablecer contraseña",
    `<p>Haz clic aquí para restablecer tu contraseña:</p>
     <a href="${link}">${link}</a>`
  );
};

module.exports = {
  login,
  register,
  sendPasswordReset,
};