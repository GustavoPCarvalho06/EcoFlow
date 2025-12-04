import express from "express";
import dia from "../controllers/statusDiaController.js";

const router = express.Router();

router.get('/', dia.readAllUserController);

router.post("/getFilter", /*auth , */ dia.readFilterstatusSensorRotasController)
router.post("/getFilterBetween", /*auth,*/ dia.readFilterBetweenStatusSensorRotasController)

export default router;


