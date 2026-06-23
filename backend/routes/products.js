const express = require('express');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/products
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { cat, search, section } = req.query;
    let sql = 'SELECT * FROM products WHERE active = 1';
    const params = [];

    if (cat && cat !== 'Todos') {
      sql += ' AND cat = ?';
      params.push(cat);
    }
    if (section) {
      sql += ' AND section = ?';
      params.push(section);
    }
    if (search) {
      sql += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY id ASC';
    const products = db.prepare(sql).all(...params);
    res.json({ products });
  } catch (err) {
    console.error('Products error:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// POST /api/products (inventory)
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, cat, price, old_price, img, section, stock, descripcion } = req.body;
    if (!name || !cat || !price) {
      return res.status(400).json({ error: 'Nombre, categoría y precio requeridos' });
    }
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO products (name, cat, price, old_price, img, section, stock, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(name, cat, price, old_price || 0, img || '', section || 'destacados', stock || 0, descripcion || '');

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/products/:id (inventory)
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { name, cat, price, old_price, img, section, stock, descripcion, active } = req.body;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        cat = COALESCE(?, cat),
        price = COALESCE(?, price),
        old_price = COALESCE(?, old_price),
        img = COALESCE(?, img),
        section = COALESCE(?, section),
        stock = COALESCE(?, stock),
        descripcion = COALESCE(?, descripcion),
        active = COALESCE(?, active)
      WHERE id = ?
    `).run(
      name || null, cat || null, price || null,
      old_price !== undefined ? old_price : null,
      img !== undefined ? img : null,
      section || null, stock !== undefined ? stock : null,
      descripcion !== undefined ? descripcion : null,
      active !== undefined ? (active ? 1 : 0) : null,
      req.params.id
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/products/:id (soft delete)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare('UPDATE products SET active = 0 WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
