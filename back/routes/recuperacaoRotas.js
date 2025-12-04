import { Router } from 'express';
import recuperacaoController from "../controllers/RecuperacaoController.js";

const router = Router();

router.post('/enviar-codigo', recuperacaoController.enviarCodigoController);

router.post('/verificar-codigo', recuperacaoController.verificarCodigoController);

router.post('/redefinir-senha', recuperacaoController.redefinirSenhaController);

export default router;