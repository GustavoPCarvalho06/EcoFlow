import express from "express";
import msg from "../controllers/statusMsgController.js";

const router = express.Router();

router.get('/', msg.readAllUserController);

router.post("/getFilter", /*auth , */ msg.readFilterstatusSensorRotasController)
router.post("/getFilterBetween", /*auth,*/ msg.readFilterBetweenStatusSensorRotasController)

export default router;


