const express = require('express');
const router = express.Router();

//----------------------------------------------------------------------------------------------------------
const inventario = {
  embarcadero: {
    '0001': { name: 'Menú completo', price: 17300, stock: 8, category: 'fuertes' },
    '0002': { name: 'Menú ligero', price: 13300, stock: 15, category: 'fuertes' },
    '0003': { name: 'Menú rápido', price: 15300, stock: 17, category: 'fuertes' }
  },
  meson: {
    '0001': { name: 'Menú completo', price: 17300, stock: 8, category: 'fuertes' },
    '0002': { name: 'Menú ligero', price: 13300, stock: 15, category: 'fuertes' },
    '0003': { name: 'Menú rápido', price: 15300, stock: 17, category: 'fuertes' }
  },
  banderitas: {
    '0001': { name: 'Pizza de peperoni', price: 15000, stock: 8, category: 'fuertes' }
  },
  arcos: {
    '0001': { name: 'Ensalada mediterránea', price: 29000, stock: 8, category: 'fuertes' }
  },
  terrazaLiving: {
    '0001': { name: 'Bowl de pollo', price: 15000, stock: 8, category: 'fuertes' },
    '0002': { name: 'Pastel de pollo', price: 5000, stock: 40, category: 'panaderia' },
    '0003': { name: 'Fuze Tea durazno', price: 4000, stock: 20, category: 'bebidas' }
  },
  cafeBolsa: {
    '0001': { name: 'Galleta de chips', price: 3800, stock: 8, category: 'panaderia' },
    '0002': { name: 'Frappé de Kola Román', price: 5800, stock: 21, category: 'bebidas' }
  },
  restauranteEscuela: {
    '0001': { name: 'Paella', price: 27000, stock: 7, category: 'fuertes' }
  },
  terrazaEscuela: {
    '0001': { name: 'Hamburguesa Escuela', price: 19000, stock: 7, category: 'fuertes' }
  },
  puntoWok: {
    '0001': { name: 'Honey Chiken', price: 16000, stock: 8, category: 'fuertes' }
  },
  puntoCrepes: {
    '0001': { name: 'Burrito de pollo', price: 23000, stock: 3, category: 'fuertes' }
  },
  puntoSandwich: {
    '0001': { name: 'Sandwich de pavo', price: 15000, stock: 3, category: 'fuertes' }
  },
  embarcaderoCarta: {
    '0001': { name: 'Hamburguesa', price: 19000, stock: 10, category: 'fuertes' },
    '0002': { name: 'Hamburguesa de pollo', price: 19000, stock: 11, category: 'fuertes' },
    '0003': { name: 'Especial de carne', price: 27000, stock: 16, category: 'fuertes' }
  }
};
//----------------------------------------------------------------------------------------------------------

const restaurantNames = {
  embarcadero: "Embarcadero",
  meson: "Mesón",
  banderitas: "Banderitas",
  arcos: "Arcos",
  terrazaLiving: "Terraza Living",
  cafeBolsa: "Café Bolsa",
  restauranteEscuela: "Restaurante Escuela",
  terrazaEscuela: "Terraza Escuela",
  puntoWok: "Punto Wok",
  puntoCrepes: "Punto Crepes",
  puntoSandwich: "Punto Sandwich",
  embarcaderoCarta: "Embarcadero (Carta)"
};


//--------------------------------------------------------------------------------------------------

// GET: búsqueda global para cliente (con o sin filtro)
router.get('/inventory/cliente', (req, res) => {
  const filtro = req.query.filter?.toLowerCase().trim();
  const resultado = [];

  for (const restauranteId in inventario) {
    const productos = inventario[restauranteId];

    for (const productoId in productos) {
      const producto = productos[productoId];

      // Si hay filtro, solo agregar si coincide. Si no hay filtro, agregar todo.
      if (!filtro || producto.name.toLowerCase().includes(filtro)) {
        resultado.push({
          restaurante: restauranteId,
          restaurantName: restaurantNames[restauranteId] || restauranteId, 
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

  inventario[restauranteId][id] = { name, price, stock, category };

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

// GET: obtener lista de restaurantes para poder llevarlo al front
router.get('/inventory', (req, res) => {
  const restaurantes = Object.keys(inventario);
  res.json(restaurantes);
});


module.exports = {
  router,
  inventario
};
