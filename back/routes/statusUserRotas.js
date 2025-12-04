import express from "express";
import status from "../controllers/statusUserController.js";
import auth from "../middelewares/authMiddleware.js";

const router = express.Router();

router.get('/', status.readAllUserController);

router.post("/getFilter", auth ,  status.readFilterstatusSensorRotasController)
router.post("/getFilterBetween", auth, status.readFilterBetweenStatusSensorRotasController)

export default router;


