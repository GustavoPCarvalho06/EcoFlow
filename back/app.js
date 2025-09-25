import express from 'express';
const app = express();
import cors from 'cors';
// import os from 'os';

//Rotas
import user from "./routes/userRotas.js"
import login from "./routes/loginRotas.js"


app.use(cors());
app.use(express.json());



//Rotas
app.use('/user', user) 

app.use('/login', login) 



// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});  




const PORT = 3001;


app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Servidor encerrado');
  });
});