import { Router } from 'express';
import LogController from "../controllers/LogController.js";
import auth from "../middelewares/authMiddleware.js";

const router = Router();

// Só administradores e coordenadores devem ver logs
router.get('/', auth, LogController.listarLogsController);

export default router;