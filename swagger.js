const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EbanPay API',
      version: '1.0.0',
      description: 'API documentation for EbanPay Backend',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    }
  },
  
  apis: ['./routes/*.js'], // ✅ will auto-scan route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
