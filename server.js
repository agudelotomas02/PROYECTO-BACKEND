const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api', authRoutes); 


const { router: inventoryRoutes } = require('./routes/inventoryRoutes');
app.use('/api', inventoryRoutes);

const { router: cartsRoutes } = require('./routes/cartsRoutes');
app.use('/api', cartsRoutes);

const { router: pedidosRoutes } = require('./routes/pedidosRoutes');
app.use('/api', pedidosRoutes);

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`It's alive on http://localhost:${PORT}`);
});

module.exports = app;

