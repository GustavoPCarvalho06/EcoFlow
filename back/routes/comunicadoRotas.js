// routes/comunicadoRotas.js (VERSÃO FINAL E CORRIGIDA)

import { Router } from 'express';
import ComunicadoController from "../controllers/ComunicadoController.js";

const router = Router();

// ====================================================================
// ROTAS ESPECÍFICAS (sem parâmetros no meio) VÊM PRIMEIRO
// ====================================================================

// Rota GET para buscar todos os comunicados
router.get('/', ComunicadoController.getAllComunicadosController);

// Rota POST para criar um novo comunicado
router.post('/', ComunicadoController.createComunicadoController);

// Rota para pegar os IDs dos comunicados não vistos
router.get('/unseen-ids', ComunicadoController.getUnseenIdsController);

// Rota para contar comunicados não vistos
router.get('/unseen-count', ComunicadoController.countUnseenController);

// Rota para marcar todos os comunicados como vistos
router.post('/mark-all-seen', ComunicadoController.markAllSeenController);

// Rota para marcar um único comunicado como visto
router.post('/mark-one-seen/:comunicadoId', ComunicadoController.markOneSeenController);

router.get('/unseen-ids-detailed', ComunicadoController.getDetailedUnseenIdsController);

// ====================================================================
// ROTAS GENÉRICAS (com parâmetros como :id) VÊM POR ÚLTIMO
// ====================================================================

// Rota PUT para atualizar um comunicado por ID
router.put('/:id', ComunicadoController.updateComunicadoController);

// Rota DELETE para deletar um comunicado por ID
router.delete('/:id', ComunicadoController.deleteComunicadoController);

export default router;