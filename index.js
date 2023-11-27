const express = require('express');
const app = express();
const routes = require('./routes');
const { swaggerDocs } = require("./swagger");
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

app.use(express.json());

app.use('/', routes);

// Ruta para servir la documentación Swagger
swaggerDocs(app, 4000);

app.listen(4000, () => {
  console.log('Servidor iniciado en el puerto 4000 http://localhost:4000/');
});
