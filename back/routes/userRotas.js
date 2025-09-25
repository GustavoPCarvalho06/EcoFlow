import { Router } from 'express';
import user from "../controllers/UserController.js"

const router = Router();

router.get('/get', user.readAllUserController);

router.get('/get_id/:id', user.readFilterUserController);

router.put('/put', user.updateUserController)

router.post('/post', user.createUserController);




export default router;