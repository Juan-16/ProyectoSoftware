const admin = require("../../../firebaseAdmin");
const { enviarCorreo } = require("../../../shared/services/emailService");

const PasswordResetInput = async (email) => {
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

module.exports = PasswordResetInput;
