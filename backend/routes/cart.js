const express = require('express');
const { getDb } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart
router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const items = db.prepare(`
      SELECT ci.id, ci.product_id as id, ci.qty, p.name, p.cat, p.price, p.old_price, p.img, p.section
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.active = 1
    `).all(req.user.id);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
});

// POST /api/cart/add
router.post('/add', authenticateToken, (req, res) => {
  try {
    const { product_id, qty } = req.body;
    if (!product_id) return res.status(400).json({ error: 'Producto requerido' });

    const db = getDb();
    const product = db.prepare('SELECT id, stock FROM products WHERE id = ? AND active = 1').get(product_id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const existing = db.prepare('SELECT id, qty FROM cart_items WHERE user_id = ? AND product_id = ?')
      .get(req.user.id, product_id);

    if (existing) {
      db.prepare('UPDATE cart_items SET qty = qty + ? WHERE id = ?').run(qty || 1, existing.id);
    } else {
      db.prepare('INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?)')
        .run(req.user.id, product_id, qty || 1);
    }

    const items = db.prepare(`
      SELECT ci.id, ci.product_id as id, ci.qty, p.name, p.cat, p.price, p.old_price, p.img, p.section
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.active = 1
    `).all(req.user.id);

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar al carrito' });
  }
});

// PUT /api/cart/:productId
router.put('/:productId', authenticateToken, (req, res) => {
  try {
    const { qty } = req.body;
    const db = getDb();

    if (qty <= 0) {
      db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?')
        .run(req.user.id, req.params.productId);
    } else {
      const result = db.prepare('UPDATE cart_items SET qty = ? WHERE user_id = ? AND product_id = ?')
        .run(qty, req.user.id, req.params.productId);
      if (result.changes === 0) return res.status(404).json({ error: 'Producto no en carrito' });
    }

    const items = db.prepare(`
      SELECT ci.id, ci.product_id as id, ci.qty, p.name, p.cat, p.price, p.old_price, p.img, p.section
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.active = 1
    `).all(req.user.id);

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar carrito' });
  }
});

// DELETE /api/cart/:productId
router.delete('/:productId', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?')
      .run(req.user.id, req.params.productId);

    const items = db.prepare(`
      SELECT ci.id, ci.product_id as id, ci.qty, p.name, p.cat, p.price, p.old_price, p.img, p.section
      FROM cart_items ci JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.active = 1
    `).all(req.user.id);

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar del carrito' });
  }
});

// DELETE /api/cart (clear cart)
router.delete('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    res.json({ items: [] });
  } catch (err) {
    res.status(500).json({ error: 'Error al vaciar carrito' });
  }
});

module.exports = router;
