import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import os from 'os'; // Módulo para obter informações do sistema

// Importação das suas rotas
import user from "./routes/userRotas.js"
import login from "./routes/loginRotas.js"
import lixo from "./routes/lixoRotas.js"
import msg from "./routes/msgRotas.js"
import comunicados from "./routes/comunicadoRotas.js"

import sensor from "./routes/statusSensorRotas.js"
import userStatus from "./routes/statusUserRotas.js"
import msgStatus from "./routes/statusMsgRotas.js"
import diaStatus from "./routes/statusDiaRotas.js"
import configureChat from './socket/chat.js';

const app = express();
const server = http.createServer(app);

// --- INÍCIO DA CONFIGURAÇÃO DE REDE E CORS ---

// 1. Função para encontrar o endereço de IP local na rede
const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Pega o primeiro endereço IPv4 que não seja interno (loopback)
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost'; // Retorna localhost como fallback
};

const localIp = getLocalIpAddress();
const frontendPort = 3000; // A porta padrão do seu frontend Next.js

// 2. Lista de origens permitidas para o CORS
//    Isso permite que o frontend se conecte usando localhost ou o IP da rede.
const allowedOrigins = [
  `http://localhost:${frontendPort}`,
  `http://${localIp}:${frontendPort}`
];

console.log('[Backend] Origens de CORS permitidas:', allowedOrigins);

// 3. Opções de CORS para serem usadas tanto pelo Express quanto pelo Socket.IO
const corsOptions = {
  // A função de 'origin' verifica se a origem da requisição está na nossa lista
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso negado pelo CORS'));
    }
  },
  credentials: true, // Essencial para permitir o envio de cookies/credenciais
};

// --- FIM DA CONFIGURAÇÃO DE REDE E CORS ---

// 4. Inicializa o Socket.IO com as opções de CORS
const io = new Server(server, {
  cors: corsOptions
});

// 5. Aplica o middleware do CORS ao Express com as mesmas opções
app.use(cors(corsOptions));

// Seus middlewares
app.use(express.json());
app.use(cookieParser()); 

// Middleware para injetar o 'io' em todas as requisições
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Suas Rotas
app.use('/lixo', lixo);
app.use('/user', user);
app.use('/login', login);
app.use('/msg', msg);
app.use('/comunicados', comunicados);

// Suas Views (Rotas de Status)
app.use('/statusSensor', sensor);
app.use('/userStatus', userStatus);
app.use('/msgStatus', msgStatus);
app.use('/diaStatus', diaStatus);

// Handler para rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

// Configura o chat do Socket.IO
configureChat(io);

const PORT = 3001;
const HOST = '0.0.0.0'; // 6. Essencial para escutar em todas as interfaces de rede

// Inicia o servidor
server.listen(PORT, HOST, () => {
  console.log(`\n✅ Servidor Backend rodando!`);
  console.log(`   - Acesso Local:   http://localhost:${PORT}`);
  console.log(`   - Acesso na Rede: http://${localIp}:${PORT}`);
});

// Handler para encerramento gracioso
process.on('SIGTERM', () => {
  if (server) { 
    server.close(() => {
      console.log('Servidor encerrado');
    });
  } else {
    console.log('Servidor encerrado (sem referência a "server")');
    process.exit(0);
  }
});