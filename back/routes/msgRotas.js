// routes/msgRotas.js (VERSÃO CORRIGIDA E FOCADA EM MENSAGENS)

import { Router } from 'express';
import msgController from "../controllers/msgController.js";
// routes/msgRotas.js

import authMiddleware from '../middelewares/authMiddleware.js';

const router = Router();

// Rota para buscar o histórico de mensagens entre o usuário logado e outro usuário
// Ex: GET http://localhost:3001/msg/historico/15
router.get(
    '/historico/:outroUsuarioId', 
    authMiddleware, // 1. Protege a rota, garantindo que o usuário está logado
    msgController.getHistoricoConversaController // 2. Chama o controller
);


export default router;