const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: { title: 'APIExpress', version: '1.0.0'},
    },
    apis: ['routes.js']
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app, port) => {
    app.use('', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = { swaggerDocs };