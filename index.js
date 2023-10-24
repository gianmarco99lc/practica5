const express = require('express');
const app = express();
const routes = require('./routes');

app.use(express.json());

app.use('/', routes);

app.listen(4000, () => {
  console.log('Servidor iniciado en el puerto 4000');
});