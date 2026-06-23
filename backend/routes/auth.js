const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, pass, dir } = req.body;
    if (!name || !email || !pass) {
      return res.status(400).json({ error: 'Nombre, email y contraseña requeridos' });
    }
    if (pass.length < 4) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const hash = bcrypt.hashSync(pass, 10);
    const result = db.prepare('INSERT INTO users (name, email, pass, dir) VALUES (?, ?, ?, ?)').run(name, email, hash, dir || '');

    const user = { id: result.lastInsertRowid, name, email, dir: dir || '' };
    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error al registrar' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, pass } = req.body;
    if (!email || !pass) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const db = getDb();
    const user = db.prepare('SELECT id, name, email, pass, dir, phone FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(pass, user.pass)) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const userData = { id: user.id, name: user.name, email: user.email, dir: user.dir, phone: user.phone };
    const token = generateToken(userData);

    res.json({ token, user: userData });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, dir, phone, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// PUT /api/auth/me
router.put('/me', authenticateToken, (req, res) => {
  try {
    const { name, dir, phone } = req.body;
    const db = getDb();
    db.prepare('UPDATE users SET name = COALESCE(?, name), dir = COALESCE(?, dir), phone = COALESCE(?, phone) WHERE id = ?')
      .run(name || null, dir !== undefined ? dir : null, phone !== undefined ? phone : null, req.user.id);

    const user = db.prepare('SELECT id, name, email, dir, phone, created_at FROM users WHERE id = ?').get(req.user.id);
    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

module.exports = router;
