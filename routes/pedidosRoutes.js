const express = require('express');
const router = express.Router();

// Carritos y pedidos en memoria
const { inventario } = require('./inventoryRoutes');
const carritos = require('./cartsRoutes').carritos; // Asumimos que exportaste carritos también
const pedidos = {};
const contadorPedidos = {}; // Controla el ID autoincremental por restaurante

// POST: Generar pedido desde carrito de usuario en restaurante
router.post('/orders/:usuario/:restauranteId', (req, res) => {
  const { usuario, restauranteId } = req.params;
  const carrito = carritos[usuario]?.[restauranteId];

  if (!carrito || Object.keys(carrito).length === 0) {
    return res.status(400).json({ error: 'Carrito vacío o no existe' });
  }

  // Inicializar estructura
  if (!pedidos[restauranteId]) pedidos[restauranteId] = {};
  if (!contadorPedidos[restauranteId]) contadorPedidos[restauranteId] = 1;

  const numeroPedido = `P${contadorPedidos[restauranteId]++}`;
  pedidos[restauranteId][numeroPedido] = {
    usuario,
    productos: carrito,
    estado: 'creado'
  };

  // Eliminar carrito luego del pedido
  delete carritos[usuario][restauranteId];

  res.status(201).json({ mensaje: 'Pedido creado', numeroPedido, pedido: pedidos[restauranteId][numeroPedido] });
});

// GET: Cliente consulta sus pedidos por restaurante
router.get('/orders/:usuario', (req, res) => {
  const { usuario } = req.params;
  const resultado = [];

  for (const restauranteId in pedidos) {
    for (const pedidoId in pedidos[restauranteId]) {
      const pedido = pedidos[restauranteId][pedidoId];
      if (pedido.usuario === usuario) {
        resultado.push({ restauranteId, pedidoId, ...pedido });
      }
    }
  }

  if (resultado.length === 0) {
    return res.status(404).json({ mensaje: 'El usuario no tiene pedidos registrados.' });
  }

  res.json(resultado);
});

// GET: POS consulta pedidos en su restaurante
router.get('/orders/restaurante/:restauranteId', (req, res) => {
  const { restauranteId } = req.params;
  const pedidosRest = pedidos[restauranteId];

  if (!pedidosRest || Object.keys(pedidosRest).length === 0) {
    return res.status(404).json({ mensaje: 'No hay pedidos en este restaurante.' });
  }

  res.json(pedidosRest);
});

// PUT: POS cambia estado de pedido
router.put('/orders/:restauranteId/:pedidoId', (req, res) => {
  const { restauranteId, pedidoId } = req.params;
  const { estado } = req.body;

  const pedido = pedidos[restauranteId]?.[pedidoId];
  if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado.' });

  if (!['creado', 'preparando', 'listo'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  pedido.estado = estado;
  res.json({ mensaje: 'Estado actualizado', pedido });
});

module.exports = { router: router, pedidos };