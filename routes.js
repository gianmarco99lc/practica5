const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Obtener la ruta de la carpeta del proyecto
const projectPath = path.dirname(__filename);

// Crear la ruta de la carpeta donde quieres guardar el archivo
const folderPath = path.join(projectPath, 'data');

// Verificar si la carpeta existe
if (!fs.existsSync(folderPath)) {
  // Si no existe, crear la carpeta
  fs.mkdirSync(folderPath);
}

// Crear la ruta del archivo
const filePath = path.join(folderPath, 'bd.json');

// Verificar si el archivo existe
if (!fs.existsSync(filePath)) {
  // Si no existe, crea un objeto inicial vacío y guárdalo en el archivo
  fs.writeFileSync(filePath, '[]');
}

const data = fs.readFileSync(filePath, 'utf8');
const objetos = JSON.parse(data);

// Las operaciones que modifican objetos deben escribir en el archivo
function guardarObjetos() {
  fs.writeFileSync(filePath, JSON.stringify(objetos, null, 2));
}

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Obtiene el estado del servidor
 *     responses:
 *       200:
 *         description: Una respuesta simple que indica que el servidor está funcionando
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: pong
 */
router.get('/status', (req, res) => {
  res.send('pong');
});

/**
 * @swagger
 * /directories:
 *   get:
 *     summary: Obtiene un listado de objetos paginados
 *     parameters:
 *       - name: page
 *         in: query
 *         description: El número de página a mostrar
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: El número de objetos por página
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Un objeto que contiene el listado de objetos y la información de paginación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: El número de objetos en la página actual
 *                 page:
 *                   type: integer
 *                   description: El número de página actual
 *                 pageSize:
 *                   type: integer
 *                   description: El número de objetos por página
 *                 totalPages:
 *                   type: integer
 *                   description: El número total de páginas
 *                 next:
 *                   type: integer
 *                   description: El número de la página siguiente, o null si no hay
 *                 previous:
 *                   type: integer
 *                   description: El número de la página anterior, o null si no hay
 *                 results:
 *                   type: array
 *                   description: El arreglo de objetos de la página actual
 *                   items:
 *                     type: object
 *                     description: Un objeto con los datos de un objeto
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: El identificador único del objeto
 *                       name:
 *                         type: string
 *                         description: El nombre del objeto
 *                       emails:
 *                         type: string
 *                         description: Los emails del objeto
 */
router.get('/directories', (req, res) => {
// GET /directories/?page=1&pageSize=5 -> Listado de objetos paginados
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

/**
 * @swagger
 * /directories:
 *   post:
 *     summary: Crea un nuevo objeto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: El objeto a crear
 *             properties:
 *                       name:
 *                         type: string
 *                         description: El nombre del objeto
 *                       emails:
 *                         type: string
 *                         description: Los emails del objeto
 *     responses:
 *       201:
 *         description: El objeto creado con un ID único
 */
router.post('/directories', (req, res) => {
  const nuevoObjeto = req.body;

  // Generar un ID único para el nuevo objeto
  const lastObjeto = objetos[objetos.length - 1];
  const newId = lastObjeto ? lastObjeto.id + 1 : 1;
  
  nuevoObjeto.id = newId;
  objetos.push(nuevoObjeto);

  // Guardar los objetos en el archivo JSON
  fs.writeFileSync(filePath, JSON.stringify(objetos, null, 2));

  res.status(201).json(nuevoObjeto);
});

/**
 * @swagger
 * /directories/{id}:
 *   get:
 *     summary: Obtiene un objeto por su ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: El identificador único del objeto
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: El objeto con el ID dado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Un objeto con los datos del objeto
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: El identificador único del objeto
 *                 name:
 *                   type: string
 *                   description: El nombre del objeto
 *                 emails:
 *                   type: string
 *                   description: Los emails del objeto del objeto
 *       404:
 *         description: El objeto no fue encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Un objeto con un mensaje de error
 *               properties:
 *                 message:
 *                   type: string
 *                   description: El mensaje de error
 *                   example: Objeto no encontrado
 */
router.get('/directories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const objeto = objetos.find(obj => obj.id === id);

  if (objeto) {
    res.json(objeto);
  } else {
    res.status(404).json({ message: 'Objeto no encontrado' });
  }
});

/**
 * @swagger
 * /directories/{id}:
 *   put:
 *     summary: Actualiza un objeto por su ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: El identificador único del objeto
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: El objeto con los datos a actualizar
 *             properties:
 *               name:
 *                 type: string
 *                 description: El nombre del objeto
 *               emails:
 *                 type: string
 *                 description: Los emails del objeto
 *     responses:
 *       200:
 *         description: El objeto actualizado con el ID dado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Un objeto con los datos del objeto actualizado
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: El identificador único del objeto
 *                 name:
 *                   type: string
 *                   description: El nombre del objeto
 *                 emails:
 *                   type: string
 *                   description: Los emails del objeto
 *       404:
 *         description: El objeto no fue encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Un objeto con un mensaje de error
 *               properties:
 *                 message:
 *                   type: string
 *                   description: El mensaje de error
 *                   example: Objeto no encontrado
 */
router.put('/directories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const objetoIndex = objetos.findIndex(obj => obj.id === id);

  if (objetoIndex !== -1) {
    objetos[objetoIndex] = { id, ...req.body };

    // Guardar la matriz actualizada en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(objetos, null, 2));

    res.json(objetos[objetoIndex]);
  } else {
    res.status(404).json({ message: 'Objeto no encontrado' });
  }
});

/**
 * @swagger
 * /directories/{id}:
 *   patch:
 *     summary: Modifica parcialmente un objeto por su ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: El identificador único del objeto
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: El objeto con los datos a modificar
 *             properties:
 *               name:
 *                 type: string
 *                 description: El nombre del objeto
 *               emails:
 *                 type: string
 *                 description: Los emails del objeto
 *     responses:
 *       200:
 *         description: El objeto modificado con el ID dado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Un objeto con los datos del objeto modificado
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: El identificador único del objeto
 *                 name:
 *                   type: string
 *                   description: El nombre del objeto
 *                 emails:
 *                   type: string
 *                   description: Los emails del objeto
 *       404:
 *         description: El objeto no fue encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Un objeto con un mensaje de error
 *               properties:
 *                 message:
 *                   type: string
 *                   description: El mensaje de error
 *                   example: Objeto no encontrado
 */
router.patch('/directories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const objetoIndex = objetos.findIndex(obj => obj.id === id);

  if (objetoIndex !== -1) {
    objetos[objetoIndex] = { ...objetos[objetoIndex], ...req.body };

    // Guardar la matriz actualizada en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(objetos, null, 2));

    res.json(objetos[objetoIndex]);
  } else {
    res.status(404).json({ message: 'Objeto no encontrado' });
  }
});

/**
 * @swagger
 * /directories/{id}:
 *   delete:
 *     summary: Elimina un objeto por su ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: El identificador único del objeto
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: El objeto eliminado con el ID dado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Un objeto con los datos del objeto eliminado
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: El identificador único del objeto
 *                 name:
 *                   type: string
 *                   description: El nombre del objeto
 *                 emails:
 *                   type: string
 *                   description: Los emails del objeto
 *       404:
 *         description: El objeto no fue encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Un objeto con un mensaje de error
 *               properties:
 *                 message:
 *                   type: string
 *                   description: El mensaje de error
 *                   example: Objeto no encontrado
 */
router.delete('/directories/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const objetoIndex = objetos.findIndex(obj => obj.id === id);

  if (objetoIndex !== -1) {
    const deletedObjeto = objetos.splice(objetoIndex, 1);

    // Guardar la matriz actualizada en el archivo JSON
    fs.writeFileSync(filePath, JSON.stringify(objetos, null, 2));

    res.json(deletedObjeto[0]);
  } else {
    res.status(404).json({ message: 'Objeto no encontrado' });
  }
});

module.exports = router;
