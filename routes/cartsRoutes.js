const express = require('express');
const router = express.Router();

// Importar inventario desde  desde inventoryRoutes.js
const { inventario } = require('./inventoryRoutes');

const carritos = {};

// Función auxiliar para obtener disponibilidad
function calcularDisponibilidad(stock) {
  if (stock === 0) return 'Agotado';
  if (stock === 1) return '1';
  if (stock <= 4) return String(stock);
  if (stock <= 9) return '+5';
  return '+9';
}

// GET: Ver carrito completo de un usuario
router.get('/cart/:usuario', (req, res) => {
  const { usuario } = req.params;
  if (!carritos[usuario]) {
    return res.json({ mensaje: 'El usuario no tiene carritos activos.' });
  }
  res.json(carritos[usuario]);
});

// GET: Ver carrito de un restaurante específico
router.get('/cart/:usuario/:restauranteId', (req, res) => {
  const { usuario, restauranteId } = req.params;
  const carrito = carritos[usuario]?.[restauranteId];
  if (!carrito) {
    return res.status(404).json({ mensaje: 'Carrito no encontrado para ese restaurante.' });
  }
  res.json(carrito);
});

// POST: Agregar producto a un carrito
router.post('/cart/:usuario/:restauranteId/:productoId', (req, res) => {
  const { usuario, restauranteId, productoId } = req.params;
  const { cantidad } = req.body;

  const producto = inventario[restauranteId]?.[productoId];
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado en inventario.' });

  if (!carritos[usuario]) carritos[usuario] = {};
  if (!carritos[usuario][restauranteId]) carritos[usuario][restauranteId] = {};

  const disponibilidad = calcularDisponibilidad(producto.stock);
  const total = producto.price * cantidad;

  carritos[usuario][restauranteId][productoId] = {
    cantidad,
    disponibilidad,
    total
  };

  res.status(201).json({ mensaje: 'Producto agregado al carrito', carrito: carritos[usuario][restauranteId] });
});

// PUT: Actualizar cantidad de un producto
router.put('/cart/:usuario/:restauranteId/:productoId', (req, res) => {
  const { usuario, restauranteId, productoId } = req.params;
  const { cantidad } = req.body;

  if (!carritos[usuario]?.[restauranteId]?.[productoId]) {
    return res.status(404).json({ error: 'Producto no está en el carrito.' });
  }

  const producto = inventario[restauranteId]?.[productoId];
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado en inventario.' });

  const disponibilidad = calcularDisponibilidad(producto.stock);
  const total = producto.price * cantidad;

  carritos[usuario][restauranteId][productoId] = { cantidad, disponibilidad, total };

  res.json({ mensaje: 'Producto actualizado en el carrito', producto: carritos[usuario][restauranteId][productoId] });
});

// DELETE: Eliminar producto de un carrito
router.delete('/cart/:usuario/:restauranteId/:productoId', (req, res) => {
  const { usuario, restauranteId, productoId } = req.params;

  const existe = carritos[usuario]?.[restauranteId]?.[productoId];
  if (!existe) return res.status(404).json({ error: 'Producto no encontrado en el carrito.' });

  delete carritos[usuario][restauranteId][productoId];
  res.json({ mensaje: 'Producto eliminado del carrito' });
});

module.exports = {
    router,
    carritos
  };
