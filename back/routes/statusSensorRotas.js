import express from "express";
import { login } from "../controllers/LoginController.js";

const router = express.Router();

// Rota de login
router.post("/sla", login);

export default router;
