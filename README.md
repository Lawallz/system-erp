# MiniERP — Sistema de Gestão para Pequenos Comércios

Sistema de gestão empresarial desenvolvido para pequenos comércios, com foco em
controle de produtos, estoque, compras, vendas, usuários e permissões de acesso.

O projeto utiliza uma arquitetura REST, separação por módulos e regras de negócio
aplicadas no backend.

## Atualização: custos, tributos informados e importações

Esta versão inclui as funcionalidades anteriores e acrescenta custos por compra, com versões estimadas e realizadas para compras nacionais, importação para revenda e encomendas internacionais.

Para atualizar uma instalação configurada, pare o backend e execute:

```bash
git fetch origin
git switch feat/import-costs
git pull --ff-only origin feat/import-costs
npm ci
npm run prisma:generate
npx prisma migrate deploy
npm run dev
```

Mantenha o `.env` e o PostgreSQL existentes. A nova migration `20260929163000_purchase_costings` cria uma tabela de revisões com índices e relações com compras/usuários. Ela não atualiza produtos, estoques ou compras existentes. Se ainda pendente, o deploy também aplica a migration anterior `20260929095000_add_product_barcode` (coluna opcional `products.barcode` e índice único). Produtos existentes ficam com código nulo; nenhum saldo ou histórico é apagado. Faça o backup habitual antes da alteração de estrutura. Não execute reset ou seed. Se sua instalação foi criada com `db push` e não possui histórico de migrations, faça o baseline das migrations já aplicadas antes do deploy; não use reset para contornar o erro. Use Node.js 24 para a suíte atual.

### Custos e importações

Abra uma compra e use **Custos, taxas e importação** no frontend `feat/import-costs`. Os itens da compra fornecem produtos e quantidades; o formulário começa com preços em BRL. Para uma importação, selecione a moeda e informe os preços unitários da invoice e o câmbio manual em BRL por unidade da moeda. A troca de moeda não converte os campos automaticamente. Despesas e bases de tributos são sempre informadas em BRL.

- Tipos: `DOMESTIC`, `COMMERCIAL_IMPORT`, `INTERNATIONAL_PARCEL`. A classificação não determina alíquotas nem elegibilidade para regimes.
- Etapas independentes: `ESTIMATE` e `ACTUAL`. Realizado exige referência de documentos; é uma declaração do operador, não confirmação bancária de pagamento.
- Encargos: `TAX` ou `EXPENSE`; valor fixo ou percentual sobre uma base explícita. Por fora = base × taxa/100. Por dentro = base × (taxa/100) ÷ (1 − taxa/100). A base por dentro deve excluir o próprio tributo. Não há composição automática de bases, deduções, descontos ou regras por NCM/UF/regime.
- Não duplique frete, seguro ou impostos já incorporados nos preços de origem. Tributos recuperáveis não são abatidos: este é um controle de desembolso gerencial, não custo contábil/fiscal.
- O cálculo usa Decimal com precisão 40; valores convertidos por item e encargos são arredondados em centavos (half-up). O rateio é proporcional ao valor convertido dos produtos, pelo método dos maiores restos, com desempate pelo ID do item. A soma dos rateios sempre fecha com o total. Custos unitários são armazenados com 6 casas; a tela mostra 2 e o CSV mantém 6.
- Margem bruta estimada usa o preço de venda do produto no momento do cálculo. Exclui tributos da venda, comissões, despesas operacionais e créditos fiscais. Não altera o custo cadastrado, preços, estoque ou total original da compra.
- Cada salvamento é uma nova revisão imutável pela API, com entrada, resultado, versão do cálculo, autor e auditoria. Etapas têm sequências próprias. Os últimos 20 registros aparecem no histórico; revisões anteriores permanecem armazenadas e consultáveis por ID.
- Mudanças nos itens da compra invalidam a assinatura do formulário; versões antigas são preservadas. A sequência esperada e uma transação serializável impedem sobrescrita concorrente. Em erro 409, recarregue e confira antes de salvar novamente.

Endpoints (todos sob `/api/purchases/:purchaseId/costing`):

| Método/caminho | Permissão | Resposta |
| --- | --- | --- |
| `GET /` | `purchases:read` | Compra, assinatura dos itens, última estimativa, último realizado e 20 revisões resumidas |
| `POST /preview` | `purchases:read` | Cálculo sem persistência |
| `POST /` | `purchases:read` + `purchases:create` | Nova revisão e auditoria na mesma transação |
| `GET /revisions/:id` | `purchases:read` | Snapshot salvo pertencente à compra informada |

O payload utiliza strings decimais com ponto, não números JSON: preços unitários e câmbio até 6 casas, valores e bases em BRL até 2. Máximo 200 itens e 60 encargos; custo total até R$ 999.999.999.999,99. `expectedRevision` vem da última versão da etapa (0 se inexistente); `purchaseFingerprint` vem de `GET /`. Campos extras, duplicatas, base/valores negativos, câmbio zero e gross-up de 100% são rejeitados.

Referências para conferir o enquadramento fora do ERP: [Simulador oficial de importação](https://www4.receita.fazenda.gov.br/simulador/) e [manual da Receita para remessas](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/manuais/remessas-postal-e-expressa/preciso-pagar-impostos-nas-compras-internacionais/quanto-pagarei-de-imposto). O sistema não importa alíquotas desses serviços e não oferece apuração fiscal ou emissão de NF-e.

### Contratos da venda rápida e das listas

- `GET /api/auth/me`: sessão autenticada, nome da função e permissões atuais; sem hash de senha. Usuário inativo retorna 401.
- `GET /api/sales/catalog?page=1&limit=20&q=termo`: exige `sales:create`, retorna somente produtos ativos e dados de venda, sem custo.
- `GET /api/sales/lookup?code=00123`: exige `sales:create`, pesquisa exata por SKU ou código de barras mantendo zeros à esquerda. 404 para inexistente/inativo; 409 quando o código coincide com SKU de outro produto.
- `GET /api/products/:id`: exige `products:read`; inclui categoria e permite consultar produto inativo.
- `GET /api/products/:id/history/:kind`: `kind` é `movements`, `sales` ou `purchases`; exige `products:read` e respectivamente `stock:read`, `sales:read` ou `purchases:read`. Paginação por padrão. Valores dos itens são históricos; compras incluem seu status atual.
- `barcode` é texto opcional, único quando preenchido, com até 80 caracteres. String vazia vira `null`. Duplicidade retorna 409. É aceito na criação e edição de produto.

As listas de produtos, categorias, fornecedores, usuários, funções, vendas, compras e movimentações aceitam paginação quando `page` ou `limit` está presente. Sem esses parâmetros, preservam o contrato legado para seletores existentes. Parâmetros: `page` (padrão 1), `limit` (padrão 20, máximo 100), `q` (até 100 caracteres), `from` e `to` (`AAAA-MM-DD`, inclusivos em UTC−03). Datas inválidas ou período invertido retornam 400. O período usa a data de criação; no histórico de itens usa a data da venda/pedido. Produtos também aceitam `status=active|inactive|all`, `categoryId` e `stock=all|low|out`.

Resposta paginada:

```json
{ "status": "success", "data": { "items": [], "pagination": { "page": 1, "pageSize": 20, "total": 0, "totalPages": 1 } } }
```

Busca e contagem usam os mesmos filtros e uma transação de leitura `RepeatableRead`; ordenação inclui ID como desempate. Relatórios agregados preservam seus contratos anteriores. O cadastro não altera saldo: a venda continua validando preços e estoque no servidor. A API de venda não possui chave de idempotência; após falha de conexão na confirmação, consulte o histórico antes de repetir.

### Novos contratos

| Endpoint | Permissão | Comportamento |
| --- | --- | --- |
| `GET /api/products?status=active/inactive/all` | `products:read` | Status ativo por padrão; mantém a resposta como array |
| `PUT /api/products/:id` | `products:update` | Edita SKU, nome, descrição, preços, categoria e mínimo; não aceita saldo nem status |
| `PATCH /api/products/:id/activate` | `products:update` | Reativa sem apagar saldo ou histórico |
| `PATCH /api/products/:id/deactivate` | `products:delete` | Desativa sem apagar saldo ou histórico |
| `GET /api/reports/inventory` | `reports:read` | Resumo de valorização e plano de reposição |

Edição e mudança de status de produtos gravam auditoria na mesma transação da alteração. SKU duplicado retorna 409; dados inválidos, 400. Desativar produto pode impedir receber compras pendentes desse item até sua reativação.

O relatório considera somente produtos ativos. Sugestão = `max(0, mínimo - estoque atual - quantidade em compras PENDING)`. O mínimo é a meta, não uma previsão de demanda: estoque exatamente no mínimo pode ter alerta, mas sugestão zero. Custos e valores potenciais usam os preços atuais cadastrados e não representam receita ou lucro realizados. O relatório usa aritmética decimal e uma leitura consistente de estoque e pedidos; valores monetários são strings com duas casas decimais. Não cria pedidos automaticamente.

As rotas de categorias agora verificam as permissões `products:*`, e as de vendas verificam `sales:read/create`. Essas permissões já existem no seed. Usuários desativados deixam de acessar também essas rotas com tokens antigos.

### Verificação e dependências

```bash
npm run typecheck
npm test
npm run build
npm audit
```

Os testes exercitam as rotas HTTP reais, autenticação/permissões, validação, contrato de transações e cálculo de reposição com Prisma simulado. Não usam nem alteram seu PostgreSQL. A validação com banco real permanece necessária.

O lockfile atualiza Express/body-parser/qs. Um override restrito ao `esbuild` usado pelo `tsup` remove o aviso de segurança da versão 0.27.x; build e testes são executados com essa resolução. Reavalie o override quando o tsup atualizar sua dependência.

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


