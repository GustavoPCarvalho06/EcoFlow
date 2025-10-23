import express from "express";
import sensor from "../controllers/statusSensorController.js";

const router = express.Router();

// Rota de login
router.get('/', sensor.readAllUserController);

router.post("/getFilter", /*auth , */ sensor.readFilterstatusSensorRotasController)
router.post("/getFilterBetween", /*auth,*/ sensor.readFilterBetweenStatusSensorRotasController)

export default router;


