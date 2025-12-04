import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import os from 'os'; 

import Aedes from 'aedes';
import { createServer } from 'net';
import { handleMqttMessage } from './mqtt/mqttHandler.js';

import user from "./routes/userRotas.js"
import login from "./routes/loginRotas.js"
import lixo from "./routes/lixoRotas.js"
import msg from "./routes/msgRotas.js"
import comunicados from "./routes/comunicadoRotas.js"
import recuperacao from "./routes/recuperacaoRotas.js";
import authRoutes from "./routes/authRotas.js";
import logs from "./routes/logRotas.js"; 
import dashboard from "./routes/dashboard.js";

import sensor from "./routes/statusSensorRotas.js"
import userStatus from "./routes/statusUserRotas.js"
import msgStatus from "./routes/statusMsgRotas.js"
import diaStatus from "./routes/statusDiaRotas.js"
import configureChat from './socket/chat.js';




const app = express();
const server = http.createServer(app);

const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost'; 
};

const localIp = getLocalIpAddress();
const frontendPort = 3000; 
const allowedOrigins = [
  `http://localhost:${frontendPort}`,
  `http://${localIp}:${frontendPort}`
];

const corsOptions = {

  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso negado pelo CORS'));
    }
  },
  credentials: true, 
};

const io = new Server(server, {
  cors: corsOptions
});

const aedes = Aedes();
const mqttServer = createServer(aedes.handle);
const MQTT_PORT = 1883; 
aedes.on('client', (client) => {
  if (client) {
    console.log(`[MQTT] Cliente conectado: ${client.id}`);
  }
});

aedes.on('clientDisconnect', (client) => {
  if (client) {
    console.log(`[MQTT] Cliente desconectado: ${client.id}`);
  }
});

aedes.on('publish', (packet, client) => {
  
  if (client) {
    
    handleMqttMessage(packet.topic, packet.payload, io);
  }
});


mqttServer.listen(MQTT_PORT, () => {
  console.log(`✅ Servidor MQTT rodando na porta ${MQTT_PORT}`);
});


app.use(cors(corsOptions));


app.use(express.json());
app.use(cookieParser()); 

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
app.use('/recuperacao', recuperacao);
app.use('/auth', authRoutes); 
app.use('/logs', logs);

// Suas Views
app.use('/dashboard', dashboard); 
app.use('/statusSensor', sensor);
app.use('/userStatus', userStatus);
app.use('/msgStatus', msgStatus);
app.use('/diaStatus', diaStatus);

app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

configureChat(io);

const PORT = 3001;
const HOST = '0.0.0.0'; 
server.listen(PORT, HOST, () => {
  console.log(`\n✅ Servidor Backend (HTTP) rodando!`);
  console.log(`   - Acesso Local:   http://localhost:${PORT}`);
  console.log(`   - Acesso na Rede: http://${localIp}:${PORT}`);
  
  
  console.log(`\n📡 Para conectar o Arduino:`);
  console.log(`   - Broker IP:      ${localIp}`);
  console.log(`   - Porta MQTT:     ${MQTT_PORT}`);
});


process.on('SIGTERM', () => {
  console.log('Encerrando servidores...');
  
  if (server) { 
    server.close(() => {
      console.log('Servidor HTTP encerrado');
    });
  }
  
  
  if (mqttServer) {
    mqttServer.close(() => {
      console.log('Servidor MQTT encerrado');
    });
  }
  
  if (!server && !mqttServer) {
    process.exit(0);
  }
});