import { Router } from 'express';
import recuperacaoController from "../controllers/RecuperacaoController.js";

const router = Router();

// 1. Rota para solicitar o envio do código
router.post('/enviar-codigo', recuperacaoController.enviarCodigoController);

// 2. Rota para verificar se o código é válido
router.post('/verificar-codigo', recuperacaoController.verificarCodigoController);

// 3. Rota para redefinir a senha (após o código ser verificado)
router.post('/redefinir-senha', recuperacaoController.redefinirSenhaController);

export default router;