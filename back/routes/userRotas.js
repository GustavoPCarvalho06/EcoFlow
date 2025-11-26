// routes/userRotas.js (VERSÃO CORRIGIDA)
import { Router } from 'express';
import user from "../controllers/UserController.js";
import auth from "../middelewares/authMiddleware.js"

const router = Router();

// 1. A NOVA ROTA '/paginated' VEM PRIMEIRO
// Rotas específicas devem sempre vir antes de rotas dinâmicas.
router.get('/paginated',auth, user.readPaginatedController);

// 2. AS ROTAS ANTIGAS VÊM DEPOIS
router.get('/get', auth, user.readAllUserController);
router.get('/get_id/:id',auth, user.readFilterUserController); // Agora não haverá mais conflito

router.put('/put', auth, user.updateUserController);
router.post('/post', auth, user.createUserController);

export default router;