const admin = require("../../firebaseAdmin"); // Tu configuración de Firebase Admin
const nodemailer = require("nodemailer");

// Configura tu transporte de correo (SMTP / Gmail / SendGrid)
// Te recomiendo usar variables de entorno para no exponer tu correo y contraseña
const transporter = nodemailer.createTransport({
  service: "gmail", // Puedes cambiarlo a otro servicio si quieres
  auth: {
    user: process.env.EMAIL_USER, // tu correo
    pass: process.env.EMAIL_PASS, // tu contraseña o App Password de Gmail
  },
});

/**
 * Envía un email de recuperación de contraseña usando Firebase Admin y Nodemailer
 * @param {string} email
 */
async function sendPasswordResetEmail(email) {
  try {
    // Genera el link de reset de contraseña
    const link = await admin.auth().generatePasswordResetLink(email);

    // Envía el correo con el link
    await transporter.sendMail({
      from: `"PitStop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Restablece tu contraseña",
      html: `
        <p>Hola,</p>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${link}">Restablecer contraseña</a>
        <p>Si no solicitaste este correo, ignóralo.</p>
      `,
    });

    console.log(`Correo de recuperación enviado a ${email}`);
  } catch (error) {
    console.error("Error al enviar correo de recuperación:", error);
    throw error;
  }
}

module.exports = { sendPasswordResetEmail };
