# 🌿 **EcoFlow -- Sistema de Gerenciamento de Resíduos**

O **EcoFlow** é um sistema completo (Web + Mobile + API + IoT) projetado
para facilitar o gerenciamento de coleta seletiva, comunicação entre
usuários, coordenadores e sensores de nível.\
O projeto integra:

-   **Back-end em Node.js**\
-   **Front-end em React + Vite**\
-   **Aplicativo Mobile em React Native (Expo)**\
-   **Sockets, MQTT e Banco de Dados MySQL**

------------------------------------------------------------------------

## 📁 **Estrutura do Projeto**

    EcoFlow/
    │
    ├── Docs/                     → Documentação institucional (TCC)
    │
    ├── back/                     → API Node.js + JWT + MySQL + MQTT + Socket.io
    │   ├── config/               → Configurações (DB, JWT, SMTP)
    │   ├── controllers/          → Lógica de cada rota
    │   ├── database/             → Schema SQL
    │   ├── middelewares/         → Middleware de autenticação
    │   ├── models/               → Models do sistema
    │   ├── mqtt/                 → Integração com sensores
    │   ├── routes/               → Rotas da API
    │   ├── socket/               → Chat em tempo real
    │   ├── app.js                → Aplicação principal
    │   └── package.json
    │
    ├── front/                    → Front-End (React + Vite)
    │   ├── public/               → Imagens, vídeos, ícones
    │   ├── src/
    │   │   ├── components/       → Componentes da interface
    │   │   ├── hooks/            → Hooks customizados
    │   │   ├── lib/              → Utilidades e rotas globais
    │   │   ├── pages/            → Páginas do sistema
    │   │   └── style/            → Estilos
    │   └── package.json
    │
    └── mobile/                   → App Mobile (React Native + Expo)
        ├── assets/               → Ícones e imagens
        ├── src/
        │   ├── config/           → API base
        │   ├── context/          → Notificações
        │   ├── navigation/       → Navegação entre telas
        │   └── screens/          → Telas do app
        └── package.json

------------------------------------------------------------------------

## 🚀 **Tecnologias Utilizadas**

### **Back-end**

-   Node.js
-   Express
-   MySQL
-   JWT Authentication
-   Bcrypt
-   MQTT (Leitura de sensores)
-   Socket.io (Chat)
-   Nodemailer (E-mail)

### **Front-end**

-   React
-   React Router
-   CSS Modules
-   Shadcn/UI
-   Axios

### **Mobile**

-   React Native
-   Expo
-   Expo Router
-   Axios

------------------------------------------------------------------------

## 🛠️ **Como Rodar o Projeto**

### 🔧 1. Back-end (API)

Instalar dependências:

``` sh
cd back
npm install
```

Criar banco: Use o arquivo:

    back/database/schema.sql

Configurar variáveis: Crie `.env` com:

    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=suasenha
    DB_NAME=ecoflow

    JWT_SECRET=sua_chave
    EMAIL_USER=seuemail
    EMAIL_PASS=suasenha

Iniciar API:

``` sh
npm start
```

------------------------------------------------------------------------

### 💻 2. Front-end (Site Web)

Instalar dependências:

``` sh
cd front
npm install
```

Rodar:

``` sh
npm run dev
```

------------------------------------------------------------------------

### 📱 3. Mobile (App Expo)

Instalar dependências:

``` sh
cd mobile
npm install
```

Rodar:

``` sh
npx expo start
```

------------------------------------------------------------------------

## 📡 Comunicação Tempo Real

### MQTT

-   Recebe dados dos sensores (nível cheio/meio).
-   Envia atualizações em tempo real.

### Socket.io

-   Chat entre usuários e coordenadores.

------------------------------------------------------------------------

## 🗄️ Banco de Dados

O schema está em:

    /back/database/schema.sql

------------------------------------------------------------------------

## ✔️ Status Atual

-   [x] API funcional\
-   [x] Dashboard\
-   [x] Integração total\
-   [x] Chat\
-   [x] Mobile funcional

------------------------------------------------------------------------

## 📜 Licença

Distribuído sob a licença **MIT**.
