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

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },

      schemas: {
        ErrorResponse: {
          type: 'object',
          required: ['status', 'message'],
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Ocorreu um erro',
            },
          },
        },

        ValidationErrorItem: {
          type: 'object',
          required: ['field', 'message'],
          properties: {
            field: {
              type: 'string',
              example: 'email',
            },
            message: {
              type: 'string',
              example: 'E-mail inválido',
            },
          },
        },

        ValidationErrorResponse: {
          type: 'object',
          required: ['status', 'message', 'errors'],
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Erro de validação',
            },
            errors: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/ValidationErrorItem',
              },
            },
          },
        },
      },

      responses: {
        BadRequest: {
          description: 'Requisição inválida ou regra de negócio não atendida',
          content: {
            'application/json': {
              schema: {
                oneOf: [
                  {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                  {
                    $ref: '#/components/schemas/ValidationErrorResponse',
                  },
                ],
              },
              examples: {
                validationError: {
                  summary: 'Erro de validação',
                  value: {
                    status: 'error',
                    message: 'Erro de validação',
                    errors: [
                      {
                        field: 'email',
                        message: 'E-mail inválido',
                      },
                    ],
                  },
                },
                businessError: {
                  summary: 'Regra de negócio',
                  value: {
                    status: 'error',
                    message: 'Dados inválidos',
                  },
                },
              },
            },
          },
        },

        Unauthorized: {
          description: 'Usuário não autenticado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              examples: {
                missingToken: {
                  summary: 'Token não fornecido',
                  value: {
                    status: 'error',
                    message: 'Token de autenticação não fornecido',
                  },
                },
                invalidToken: {
                  summary: 'Token inválido ou expirado',
                  value: {
                    status: 'error',
                    message: 'Token inválido ou expirado',
                  },
                },
                inactiveUser: {
                  summary: 'Usuário não encontrado ou inativo',
                  value: {
                    status: 'error',
                    message: 'Usuário não encontrado ou inativo',
                  },
                },
              },
            },
          },
        },

        Forbidden: {
          description: 'Usuário sem permissão para acessar o recurso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                status: 'error',
                message: 'Acesso negado: permissão insuficiente',
              },
            },
          },
        },

        NotFound: {
          description: 'Recurso não encontrado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                status: 'error',
                message: 'Recurso não encontrado',
              },
            },
          },
        },

        Conflict: {
          description: 'Conflito com um recurso já existente',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                status: 'error',
                message: 'Recurso já cadastrado',
              },
            },
          },
        },

        InternalServerError: {
          description: 'Erro interno do servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              examples: {
                applicationError: {
                  summary: 'Erro interno da aplicação',
                  value: {
                    status: 'error',
                    message: 'Internal server error',
                  },
                },
                validationMiddlewareError: {
                  summary: 'Erro interno durante validação',
                  value: {
                    status: 'error',
                    message: 'Erro interno no servidor',
                  },
                },
              },
            },
          },
        },
      },
    },
  },

  apis: ['./src/modules/**/*.routes.ts'],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);