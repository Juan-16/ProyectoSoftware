const admin = require("../../frameworks/firebaseAdmin");
const { enviarCorreo } = require("../../frameworks/mailer");

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
