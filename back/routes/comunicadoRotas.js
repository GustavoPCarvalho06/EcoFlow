import { Router } from 'express';
import ComunicadoController from "../controllers/ComunicadoController.js";
import auth from "../middelewares/authMiddleware.js";

const router = Router();

router.get('/',auth, ComunicadoController.getAllComunicadosController);

router.post('/',auth, ComunicadoController.createComunicadoController);

router.get('/unseen-ids',auth, ComunicadoController.getUnseenIdsController);

router.get('/unseen-count',auth, ComunicadoController.countUnseenController);

router.post('/mark-all-seen',auth, ComunicadoController.markAllSeenController);

router.post('/mark-one-seen/:comunicadoId',auth, ComunicadoController.markOneSeenController);

router.get('/unseen-ids-detailed',auth, ComunicadoController.getDetailedUnseenIdsController);

router.put('/:id',auth, ComunicadoController.updateComunicadoController);

router.delete('/:id',auth, ComunicadoController.deleteComunicadoController);

export default router;