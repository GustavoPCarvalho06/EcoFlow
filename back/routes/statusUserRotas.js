import express from "express";
import status from "../controllers/statusUserController.js";

const router = express.Router();

// Rota de login
router.get('/', status.readAllUserController);

router.post("/getFilter", /*auth , */ status.readFilterstatusSensorRotasController)
router.post("/getFilterBetween", /*auth,*/ status.readFilterBetweenStatusSensorRotasController)

export default router;


