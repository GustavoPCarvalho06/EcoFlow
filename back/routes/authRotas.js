import { Router } from 'express';
import authController from "../controllers/AuthController.js";

const router = Router();

router.get('/verificar-conta/:token', authController.verificarContaController);

export default router;