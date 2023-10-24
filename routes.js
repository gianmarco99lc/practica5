const express = require('express');
const router = express.Router();
const fs = require('fs');

const data = fs.readFileSync('bd.json', 'utf8');
const objetos = JSON.parse(data);

router.get('/status', (req, res) => {
  res.send('pong');
});

// GET /directories/?page=1&pageSize=5 -> Listado de objetos paginados
router.get('/directories', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedObjetos = objetos.slice(startIndex, endIndex);
  const totalObjetos = objetos.length;

  const totalPages = Math.ceil(totalObjetos / pageSize);
  const nextPage = page < totalPages ? page + 1 : null;
  const previousPage = page > 1 ? page - 1 : null;

  const listado = {
    count: paginatedObjetos.length,
    page: page,
    pageSize: pageSize,
    totalPages: totalPages,
    next: nextPage,
    previous: previousPage,
    results: paginatedObjetos,
  };

  res.json(listado);
});

router.post('/directories', (req, res) => {
  const nuevoObjeto = req.body;

  // Generar un ID único para el nuevo objeto
  const lastObjeto = objetos[objetos.length - 1];
  const newId = lastObjeto ? lastObjeto.id + 1 : 1;
  
  nuevoObjeto.id = newId;
  objetos.push(nuevoObjeto);

  res.status(201).json(nuevoObjeto);
});

router.get('/directories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const objeto = objetos.find(obj => obj.id === id);

  if (objeto) {
    res.json(objeto);
  } else {
    res.status(404).json({ message: 'Objeto no encontrado' });
  }
});

router.put('/directories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const objetoIndex = objetos.findIndex(obj => obj.id === id);

  if (objetoIndex !== -1) {
    objetos[objetoIndex] = { id, ...req.body };
    res.json(objetos[objetoIndex]);
  } else {
    res.status(404).json({ message: 'Objeto no encontrado' });
  }
});

router.patch('/directories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const objetoIndex = objetos.findIndex(obj => obj.id === id);

  if (objetoIndex !== -1) {
    objetos[objetoIndex] = { ...objetos[objetoIndex], ...req.body };
    res.json(objetos[objetoIndex]);
  } else {
    res.status(404).json({ message: 'Objeto no encontrado' });
  }
});

router.delete('/directories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const objetoIndex = objetos.findIndex(obj => obj.id === id);

  if (objetoIndex !== -1) {
    const deletedObjeto = objetos.splice(objetoIndex, 1);
    res.json(deletedObjeto[0]);
  } else {
    res.status(404).json({ message: 'Objeto no encontrado' });
  }
});

module.exports = router;
