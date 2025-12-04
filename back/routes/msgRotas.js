import { Router } from 'express';
import msgController from "../controllers/msgController.js";

const router = Router();

router.get(
    '/historico/:outroUsuarioId', 
    msgController.getHistoricoConversaController
);

router.get(
    '/unread-counts',
    msgController.getUnreadCountsController
);

router.put(
    '/mark-as-read/:remetenteId',
    msgController.markAsReadController
);

export default router;