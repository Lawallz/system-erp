import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'MiniERP API',
      version: '1.0.0',
      description:
        'API REST para gerenciamento de estoque, vendas, compras, usuários e relatórios.',
    },

    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Servidor local',
      },
    ],
  },

  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);