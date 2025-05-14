const jwt = require('jsonwebtoken');
const JWT_SECRET = 'clave_supersecreta';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token inválido' });
  }
}

function checkRole(rolEsperado) {
  return (req, res, next) => {
    if (req.user.role !== rolEsperado) {
      return res.status(403).json({ error: `Acceso solo para el rol: ${rolEsperado}` });
    }
    next();
  };
}

module.exports = { authMiddleware, checkRole };
