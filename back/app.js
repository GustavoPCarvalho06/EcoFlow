import express from 'express';
const app = express();
import cors from 'cors';
import cookieParser from 'cookie-parser'; 


import user from "./routes/userRotas.js"
import login from "./routes/loginRotas.js"
import Sensor from "./routes/statusSensorRotas.js"


app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,             
}));

app.use(express.json());
app.use(cookieParser()); 

//Rotas
app.use('/user', user)
app.use('/login', login)

app.use('/statusSensor', user)


app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});


const PORT = 3001;


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
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