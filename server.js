const express = require('express');
const equipos = require('./data/equipos.json');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Inventario TIC - RoboticMinds',
    endpoints: ['GET /api/equipos', 'GET /api/equipos/:id']
  });
});

// Devuelve la lista completa de equipos
app.get('/api/equipos', (req, res) => {
  res.json(equipos);
});

// Devuelve un equipo por su id
app.get('/api/equipos/:id', (req, res) => {
  const equipo = equipos.find((e) => e.id === req.params.id);

  if (!equipo) {
    return res.status(404).json({ error: 'Equipo no encontrado' });
  }

  res.json(equipo);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
