# MiniERP — Sistema de Gestão para Pequenos Comércios

Sistema de gestão empresarial desenvolvido para pequenos comércios, com foco em
controle de produtos, estoque, compras, vendas, usuários e permissões de acesso.

O projeto utiliza uma arquitetura REST, separação por módulos e regras de negócio
aplicadas no backend.

## Tecnologias

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- Zod
- REST API
- Git / GitHub

## Funcionalidades

### Autenticação e Segurança

- Autenticação utilizando JWT
- Hash de senhas com bcrypt
- Controle de acesso baseado em funções (RBAC)
- Sistema de Roles e Permissions
- Middleware de autenticação
- Middleware de autorização
- Verificação de usuário ativo
- Controle de acesso por permissão
- Permissões consultadas dinamicamente no banco
- Auditoria de operações

### Usuários

- Cadastro de usuários
- Listagem de usuários
- Consulta individual
- Atualização de dados
- Alteração de senha
- Ativação e desativação de usuários
- Associação de usuários a Roles
- Validação de e-mail
- Prevenção de e-mails duplicados
- Prevenção de auto-desativação

### Roles e Permissões

- Criação de Roles
- Listagem de Roles
- Consulta individual
- Atualização de Roles
- Listagem de permissões
- Associação de permissões às Roles
- Controle de acesso baseado em permissões
- Diferenciação entre Administrador e Gerente

Permissões disponíveis:

- `products:create`
- `products:read`
- `products:update`
- `products:delete`
- `purchases:create`
- `purchases:read`
- `purchases:receive`
- `reports:read`
- `sales:create`
- `sales:read`
- `sales:cancel`
- `stock:create`
- `stock:read`
- `suppliers:create`
- `suppliers:read`
- `suppliers:update`
- `users:create`
- `users:read`
- `users:update`
- `users:delete`

### Produtos e Categorias

- Cadastro de produtos
- Controle de estoque
- Definição de estoque mínimo
- Cadastro de categorias
- Ativação e desativação de produtos
- Validação de dados
- Controle de acesso por permissão

### Estoque

- Registro de movimentações
- Entradas de estoque
- Saídas de estoque
- Ajustes de estoque
- Devoluções
- Registro de perdas
- Histórico de movimentações
- Registro do estoque anterior e posterior
- Bloqueio de estoque negativo
- Identificação do usuário responsável
- Alertas de estoque mínimo
- Operações utilizando transações do Prisma

### Fornecedores

- Cadastro de fornecedores
- Listagem
- Consulta individual
- Atualização
- Ativação
- Desativação
- Validação de fornecedores ativos
- Prevenção de operações com fornecedores inativos

### Compras

- Criação de compras
- Associação com fornecedores
- Adição de produtos
- Cálculo automático do total
- Recebimento de compras
- Atualização automática do estoque
- Registro de movimentação de estoque
- Controle de status da compra
- Bloqueio de recebimento sem itens
- Bloqueio de alterações após recebimento

### Auditoria

Operações importantes são registradas no sistema através de logs de auditoria.

Os registros podem armazenar:

- Usuário responsável
- Operação realizada
- Recurso afetado
- ID do recurso
- Data da operação
- Endereço IP
- Detalhes da alteração

### Validação e Tratamento de Erros

- Validação de entrada utilizando Zod
- Validação de UUIDs
- Validação de campos obrigatórios
- Tratamento centralizado de erros
- Respostas HTTP padronizadas
- Respostas de erro estruturadas

## Testes realizados

Durante o desenvolvimento, as principais regras de negócio foram testadas
diretamente através da API.

### Autenticação

- Login do administrador
- Login do usuário Gerente
- Login após alteração de senha

### Usuários

- Criação de usuário
- Listagem de usuários
- Consulta individual
- Atualização de usuário
- Alteração de senha
- Prevenção de e-mail duplicado
- Desativação de usuário
- Ativação de usuário
- Prevenção de auto-desativação
- Bloqueio de usuário inativo mesmo utilizando JWT anteriormente emitido

### Roles e RBAC

- Criação da Role Gerente
- Associação de permissões
- Gerente acessando recursos permitidos
- Gerente bloqueado ao acessar usuários sem `users:read`
- Gerente bloqueado ao criar usuários sem `users:create`
- Alteração das permissões de uma Role
- Token antigo respeitando as novas permissões

Exemplo de resposta de autorização negada:

```json
{
  "status": "error",
  "message": "Acesso negado: permissão insuficiente"
}
````

HTTP Status:

```text
403 Forbidden
```

### Fornecedores

* Criação de fornecedor
* Listagem de fornecedores
* Consulta individual
* Atualização
* Ativação
* Desativação
* Bloqueio de segunda desativação

### Estoque

* Registro de movimentações
* Atualização do estoque
* Histórico de movimentações
* Bloqueio de estoque insuficiente
* Identificação do usuário responsável
* Registro de auditoria

### Compras

* Validação de fornecedor ativo
* Criação de compra
* Adição de itens
* Cálculo do total
* Recebimento da compra
* Atualização automática do estoque
* Criação de movimentação de estoque
* Bloqueio de compra sem itens
* Controle de status

## Arquitetura

O backend utiliza uma arquitetura modular, separando responsabilidades entre
rotas, controllers, services, schemas e middlewares.

```text
src/
│
├── config/
│
├── errors/
│
├── middlewares/
│   ├── authMiddleware.ts
│   ├── errorHandler.ts
│   └── validateSchema.ts
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── products/
│   ├── categories/
│   ├── suppliers/
│   ├── stock/
│   ├── sales/
│   ├── purchases/
│   └── reports/
│
├── app.ts
└── server.ts
```

## Fluxo de autorização

```text
Request
   │
   ▼
JWT
   │
   ▼
ensureAuthenticated
   │
   ▼
Usuário
   │
   ▼
Role
   │
   ▼
Permissions
   │
   ▼
verifyPermission()
   │
   ├── Permissão encontrada → Acesso permitido
   │
   └── Permissão ausente → 403 Forbidden
```

## Banco de Dados

O projeto utiliza PostgreSQL com Prisma ORM.

Principais recursos utilizados:

* Relacionamentos entre entidades
* Integridade referencial
* Transações
* Controle de estoque baseado em movimentações
* Registro de auditoria

## Endpoints principais

```text
POST   /api/auth/login

GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
PATCH  /api/users/:id/password
PATCH  /api/users/:id/activate
PATCH  /api/users/:id/deactivate

GET    /api/roles
POST   /api/roles
GET    /api/roles/:id
PUT    /api/roles/:id
PUT    /api/roles/:id/permissions
GET    /api/roles/permissions

GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id

GET    /api/stock
POST   /api/stock

GET    /api/suppliers
POST   /api/suppliers
GET    /api/suppliers/:id
PUT    /api/suppliers/:id

GET    /api/purchases
POST   /api/purchases
GET    /api/purchases/:id
POST   /api/purchases/:id/items
PATCH  /api/purchases/:id/receive
```

## Em desenvolvimento

* [ ] Relatórios de vendas
* [ ] Relatórios de estoque
* [ ] Curva ABC
* [ ] Dashboard gerencial
* [ ] Documentação OpenAPI / Swagger
* [ ] Testes automatizados
* [ ] Docker
* [ ] Frontend React
* [ ] Interface de gerenciamento

## Objetivo do projeto

O MiniERP foi desenvolvido como projeto de portfólio para demonstrar conhecimentos
práticos em desenvolvimento Full Stack e construção de sistemas voltados para
cenários reais.

O projeto busca demonstrar conhecimentos em:

* Desenvolvimento de APIs REST
* TypeScript
* Node.js
* Express
* PostgreSQL
* Prisma
* Autenticação e autorização
* RBAC
* Modelagem de dados
* Regras de negócio
* Controle de estoque
* Transações
* Auditoria
* Validação de dados
* Arquitetura modular

A proposta é simular um sistema utilizado em um pequeno comércio, priorizando
organização, segurança e regras de negócio em vez de apenas operações básicas
de CRUD.


