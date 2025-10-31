import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http'; // 1. Importe o módulo http nativo do Node.js
import { Server } from 'socket.io'; // 2. Importe o Server do socket.io

import user from "./routes/userRotas.js"
import login from "./routes/loginRotas.js"
import lixo from "./routes/lixoRotas.js"
import msg from "./routes/msgRotas.js"

import sensor from "./routes/statusSensorRotas.js"
import userStatus from "./routes/statusUserRotas.js"
import msgStatus from "./routes/statusMsgRotas.js"
import diaStatus from "./routes/statusDiaRotas.js"

import configureChat from './socket/chat.js';

const app = express();

const server = http.createServer(app);





const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // A mesma origem do seu frontend
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Seus middlewares (continua igual)
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,             
}));


app.use(express.json());
app.use(cookieParser()); 

//Rotas

app.use('/lixo', lixo)
app.use('/user', user)
app.use('/login', login)
app.use('/msg', msg)

//View
app.use('/statusSensor', sensor)
app.use('/userStatus', userStatus)
app.use('/msgStatus', msgStatus)
app.use('/diaStatus', diaStatus)


app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

configureChat(io);

const PORT = 3001;


server.listen(PORT, () => {
  console.log(`Servidor HTTP e WebSocket rodando em http://localhost:${PORT}`);
});

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
