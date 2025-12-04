// routes/userRotas.js (VERSÃO CORRIGIDA)
import { Router } from 'express';
import user from "../controllers/UserController.js";
import auth from "../middelewares/authMiddleware.js"

const router = Router();


router.get('/paginated',auth, user.readPaginatedController);

router.get('/get', auth, user.readAllUserController);
router.get('/get_id/:id',auth, user.readFilterUserController); 

router.put('/put', auth, user.updateUserController);
router.post('/post', auth, user.createUserController);

export default router;