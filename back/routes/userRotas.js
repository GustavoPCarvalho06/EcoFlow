// routes/userRotas.js (VERSÃO CORRIGIDA)
import { Router } from 'express';
import user from "../controllers/UserController.js";

const router = Router();

// 1. A NOVA ROTA '/paginated' VEM PRIMEIRO
// Rotas específicas devem sempre vir antes de rotas dinâmicas.
router.get('/paginated', user.readPaginatedController);

// 2. AS ROTAS ANTIGAS VÊM DEPOIS
router.get('/get', user.readAllUserController);
router.get('/get_id/:id', user.readFilterUserController); // Agora não haverá mais conflito

router.put('/put', user.updateUserController);
router.post('/post', user.createUserController);

export default router;