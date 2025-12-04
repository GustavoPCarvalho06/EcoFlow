import { Router } from 'express';
import lixo from "../controllers/lixoController.js";
import auth from "../middelewares/authMiddleware.js"; 

const router = Router();
router.put('/', auth, lixo.updateLixoController);
router.post('/', auth, lixo.createLixoController);
router.delete('/', auth, lixo.deleteLixoController);

export default router;