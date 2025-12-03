// =================================================================================
// Arquivo: back/routes/dashboard.js
// =================================================================================

import { Router } from 'express';
import DashboardController from "../controllers/DashboardController.js";
import auth from "../middelewares/authMiddleware.js";

const router = Router();

// Rota GET para pegar os dados do dashboard do coordenador
router.get('/coordenador', auth, DashboardController.getDashboardData);

export default router;