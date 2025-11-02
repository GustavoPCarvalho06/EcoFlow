// routes/msgRotas.js (VERSÃO ATUALIZADA)

import { Router } from 'express';
import msgController from "../controllers/msgController.js";

const router = Router();

// Rota para buscar o histórico da conversa (já existe)
router.get(
    '/historico/:outroUsuarioId', 
    msgController.getHistoricoConversaController
);

// [NOVO] Rota para buscar a contagem de mensagens não lidas para o usuário logado
router.get(
    '/unread-counts',
    msgController.getUnreadCountsController
);

// [NOVO] Rota para marcar as mensagens de uma conversa como lidas
router.put(
    '/mark-as-read/:remetenteId',
    msgController.markAsReadController
);

export default router;