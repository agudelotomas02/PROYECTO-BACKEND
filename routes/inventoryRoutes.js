const express = require('express');
const router = express.Router();

//----------------------------------------------------------------------------------------------------------
// Inventario organizado por restaurante
const inventario = {
  embarcadero: {
    '0001': { id: '0001', name: 'Hamburguesa', price: 12000, stock: 10, category: 'fuertes' },
    '0002': { id: '0002', name: 'Hamburguesa de pollo', price: 12000, stock: 11, category: 'fuertes' },
    '0003': { id: '0003', name: 'Galleta de chips', price: 3000, stock: 16, category: 'panaderia' }
  },
  puntoSandwich: {
    '0001': { id: '0001', name: 'Pizza', price: 15000, stock: 8, category: 'fuertes' }
  },
  puntoWok: {
    '0001': { id: '0001', name: 'Wok de Pollo', price: 13000, stock: 5, category: 'fuertes' }
  }
};
//----------------------------------------------------------------------------------------------------------

// GET: búsqueda global para cliente (con o sin filtro)
router.get('/inventory/cliente', (req, res) => {
  const filtro = req.query.filter?.toLowerCase().trim();
  const resultado = [];

  // Recorrer todos los restaurantes
  for (const restauranteId in inventario) {
    const productos = inventario[restauranteId];

    for (const productoId in productos) {
      const producto = productos[productoId];

      // Si hay filtro, solo agregar si coincide. Si no hay filtro, agregar todo.
      if (!filtro || producto.name.toLowerCase().includes(filtro)) {
        resultado.push({
          restaurante: restauranteId,
          ...producto
        });
      }
    }
  }

  if (resultado.length === 0) {
    return res.status(404).json({ mensaje: 'No se encontraron productos' });
  }

  res.json(resultado);
});
//----------------------------------------------------------------------------------------------------------

// GET: todos los productos de un restaurante
router.get('/inventory/:restauranteId', (req, res) => {
  const { restauranteId } = req.params;
  const filtro = req.query.filter;

  const restaurante = inventario[restauranteId];
  if (!restaurante) return res.status(404).json({ error: 'Restaurante no encontrado' });

  let productos = Object.values(restaurante);

  if (typeof filtro === 'string' && filtro.trim() !== '') {
    productos = productos.filter(p =>
      p.name.toLowerCase().includes(filtro.toLowerCase())
    );
  }

  res.json(productos);
});

// POST: agregar producto a un restaurante
router.post('/inventory/:restauranteId', (req, res) => {
  const { restauranteId } = req.params;
  const { id, name, price, stock, category } = req.body;

  if (!id || !name || !price || !stock || !category) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (!inventario[restauranteId]) {
    inventario[restauranteId] = {};
  }

  inventario[restauranteId][id] = { id, name, price, stock, category };

  res.status(201).json({
    mensaje: 'Producto registrado',
    producto: inventario[restauranteId][id]
  });
});

// PUT: actualizar producto de un restaurante
router.put('/inventory/:restauranteId/:productId', (req, res) => {
  const { restauranteId, productId } = req.params;
  const { name, price, stock, category } = req.body;

  const producto = inventario[restauranteId]?.[productId];
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  if (name) producto.name = name;
  if (price) producto.price = price;
  if (stock) producto.stock = stock;
  if (category) producto.category = category;

  res.json({ mensaje: 'Producto actualizado', producto });
});

// DELETE: eliminar producto de un restaurante
router.delete('/inventory/:restauranteId/:productId', (req, res) => {
  const { restauranteId, productId } = req.params;

  const restaurante = inventario[restauranteId];
  if (!restaurante || !restaurante[productId]) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const eliminado = restaurante[productId];
  delete restaurante[productId];

  res.json({ mensaje: 'Producto eliminado', eliminado });
});


module.exports = {
  router,
  inventario
};






