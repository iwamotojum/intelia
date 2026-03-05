# Intelia — Cadastro de Evento

> Formulário de inscrição em 3 passos para o evento  
> **"Utilizando as soluções da Intelia para vender mais pelo telefone e WhatsApp"**

## Stack

| Camada    | Tecnologia                  |
|-----------|-----------------------------|
| Backend   | Ruby on Rails 7.1 (API mode)|
| Frontend  | Vue 3 + Vite + Vuetify 3    |
| Banco     | PostgreSQL 16               |
| Container | Docker + Docker Compose     |

---

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24
- Docker Compose ≥ 2.20
- Portas livres: **3000** (API), **5173** (Frontend), **5432** (PostgreSQL)

---

## Como rodar (desenvolvimento)

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd intelia

# 2. Suba todos os serviços
docker compose up --build

# 3. Acesse
# Frontend → http://localhost:5173
# API      → http://localhost:3000/api/v1
# Health   → http://localhost:3000/health
```

> O banco de dados e as migrations rodam automaticamente na inicialização.

---

## Estrutura do projeto

```
intelia/
├── backend/                  # Rails API
│   ├── app/
│   │   ├── controllers/
│   │   │   └── api/v1/
│   │   │       └── registrations_controller.rb
│   │   └── models/
│   │       └── registration.rb
│   ├── config/
│   │   ├── routes.rb
│   │   ├── database.yml
│   │   └── initializers/cors.rb
│   ├── db/migrate/
│   └── Dockerfile
│
├── frontend/                 # Vue 3 + Vuetify
│   ├── src/
│   │   ├── components/steps/ # StepOne, StepTwo, StepThree
│   │   ├── composables/      # useMask (máscaras reutilizáveis)
│   │   ├── services/api.js   # Axios + interceptors
│   │   ├── stores/           # Pinia (com persistência localStorage)
│   │   ├── validators/       # Schemas Yup por passo
│   │   ├── views/            # RegistrationView, SuccessView
│   │   └── web-components/   # PhoneInput (Web Component nativo)
│   └── Dockerfile
│
├── database/
│   └── schema.sql            # SQL para criação manual do banco
│
└── docker-compose.yml
```

---

## API Endpoints

| Método | Endpoint                               | Descrição                          |
|--------|----------------------------------------|------------------------------------|
| POST   | `/api/v1/registrations`                | Cria nova sessão de cadastro       |
| GET    | `/api/v1/registrations/:session_token` | Retoma sessão existente            |
| PATCH  | `/api/v1/registrations/:session_token` | Salva dados de um passo            |

### Exemplo — Salvar passo 1

```bash
curl -X PATCH http://localhost:3000/api/v1/registrations/SEU_TOKEN \
  -H "Content-Type: application/json" \
  -d '{
    "current_step": 1,
    "registration": {
      "full_name":  "João Silva",
      "birth_date": "1990-05-20",
      "email":      "joao@exemplo.com"
    }
  }'
```

---

## Funcionalidades implementadas

### Formulário em 3 passos
- **Passo 1** — Nome Completo, Data de Nascimento, E-mail
- **Passo 2** — Endereço completo (Rua, Número, CEP, Cidade, Estado)
- **Passo 3** — Telefone Celular (obrigatório) e Telefone Fixo (opcional)

### Persistência de sessão
- Ao abrir o formulário, um `session_token` único é gerado e salvo no `localStorage`
- Cada passo é persistido imediatamente no banco via API
- Se o usuário fechar o navegador e retornar, o formulário retoma do ponto onde parou

### Máscaras e validações
| Campo         | Máscara           | Validação backend + frontend        |
|---------------|-------------------|--------------------------------------|
| Data nasc.    | DD/MM/AAAA        | Idade ≥ 16 anos, não-futuro         |
| CEP           | 00000-000         | Formato regex                        |
| Celular       | (00) 00000-0000   | Obrigatório, formato regex           |
| Telefone fixo | (00) 0000-0000    | Opcional, formato regex              |
| E-mail        | —                 | RFC 5322, unicidade                  |
| Estado        | Sigla (2 letras)  | Lista fechada de UFs                 |

### Web Components (pontos extras)
O campo de telefone é implementado como um **Web Component nativo** (`<phone-input>`),
utilizando Shadow DOM com:
- Máscara aplicada em tempo real
- Eventos customizados (`phone-change`, `phone-blur`)
- Suporte a `type="mobile"` e `type="landline"`
- Exibição de mensagens de erro via atributo

### Design — Material Design (Vuetify 3)
- Tema customizado com paleta de cores Intelia
- Stepper visual customizado com indicador de progresso
- Transições suaves entre os passos (slide-fade)
- Resumo dos dados preenchidos antes da confirmação final
- Responsivo para mobile

---

## Banco de dados — Criação manual

Caso prefira criar o banco sem Docker:

```bash
psql -U postgres
CREATE DATABASE intelia_development;
\c intelia_development
\i database/schema.sql
```

---

## Variáveis de ambiente

| Variável       | Padrão                                              | Descrição             |
|----------------|-----------------------------------------------------|-----------------------|
| `DATABASE_URL` | `postgres://intelia:intelia@db:5432/intelia_development` | Conexão PostgreSQL |
| `RAILS_ENV`    | `development`                                       | Ambiente Rails        |
| `VITE_API_URL` | `http://localhost:3000`                             | URL da API            |

---

## Decisões técnicas

- **API versionada** (`/api/v1/`) para facilitar evolução sem quebrar clientes
- **Validações contextuais por step** no model Rails — o backend valida apenas os campos do passo atual
- **session_token** como identificador anônimo — sem necessidade de autenticação para o fluxo do formulário
- **Pinia + localStorage** — estado global com persistência automática, sem depender de cookies
- **yup schemas por passo** — separação de responsabilidades clara, reutilizáveis em testes
- **Web Component com Shadow DOM** — isolamento total de estilos, interoperável com qualquer framework
- **SOLID/KISS/DRY** — useMask composable centraliza toda lógica de formatação; schemas Yup são a única fonte de verdade de validação frontend

---

## Testes

Os testes do frontend utilizam [Vitest](https://vitest.dev/) com sintaxe idêntica ao Jest.

```bash
# Entrar no container do frontend
docker exec -ti intelia-frontend-1 /bin/sh

# Rodar os testes
npm test
```

Cobertura atual: **52 testes** distribuídos em 3 arquivos:

| Arquivo                  | O que testa                                      |
|--------------------------|--------------------------------------------------|
| `tests/useMask.test.js`  | Máscaras e conversões de data (`useMask`)        |
| `tests/schemas.test.js`  | Validações Yup dos 3 passos                      |
| `tests/store.test.js`    | `init`, `saveStep` e `clearSession` (Pinia)      |

---

## Comandos úteis

```bash
# Parar tudo
docker compose down

# Ver logs da API
docker compose logs -f backend

# Resetar banco
docker compose down -v && docker compose up --build

# Rodar migrations manualmente
docker compose exec backend rails db:migrate

# Console Rails
docker compose exec backend rails console
```
