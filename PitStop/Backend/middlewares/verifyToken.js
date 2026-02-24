const admin = require("../firebaseAdmin");

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("UID del token:", decodedToken.uid); // ✅ corregido
    req.uid = decodedToken.uid; 
    next();
  } catch (error) {
    console.log("Error en verifyToken:", error); // 👈 opcional para depuración
    res.status(401).json({ error: "Token inválido" });
  }
};
