const admin = require("../../frameworks/firebaseAdmin");

const db = admin.firestore();

const RegisterInput = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email y contraseña requeridos");
  }

  const user = await admin.auth().createUser({ email, password });

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

module.exports = RegisterInput;
