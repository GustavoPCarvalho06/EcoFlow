import { Router } from 'express';
import lixo from "../controllers/lixoController.js"

const router = Router();


router.put('/', lixo.updateLixoController)

router.post('/', lixo.createLixoController);

router.delete('/', lixo.deleteLixoController);


export default router;