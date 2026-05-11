const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.enviarCorreo = async (to, asunto, mensaje) => {
  await transporter.sendMail({
    from: '"Recordatorios Vehículo 🚗" <pitstop12124@gmail.com>',
    to,
    subject: asunto,
    html: mensaje,
  });
};
