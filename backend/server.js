require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/exchange', require('./routes/exchange'));

// Fallback for SPA-like navigation
app.get('/producto.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'producto.html'));
});
app.get('/reservaciones.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'reservaciones.html'));
});
app.get('/cuenta.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'cuenta.html'));
});
app.get('/inventario.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'inventario.html'));
});

app.listen(PORT, () => {
  console.log(`La Guarapachanga backend corriendo en http://localhost:${PORT}`);
  console.log(`Abre http://localhost:${PORT} en tu navegador`);
});
