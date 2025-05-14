const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'clave_supersecreta';

// Usuarios simulados
const usuarios = [
  { id: 1, email: 'estudiante@uni.edu', password: '123', role: 'cliente' },
  { id: 2, email: 'pos@uni.edu', password: '123', role: 'pos' }
];

// Ruta de login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = usuarios.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
});

module.exports = router;
