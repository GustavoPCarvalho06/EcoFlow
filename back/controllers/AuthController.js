// Em back/controllers/AuthController.js
import { verifyUserByToken } from '../models/UserModels.js';

const verificarContaController = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token) {
            return res.status(400).json({ mensagem: "Token não fornecido." });
        }

        await verifyUserByToken(token);

        return res.status(200).json({ mensagem: "Conta ativada com sucesso!" });
    } catch (err) {
        console.error("Erro no controller ao verificar conta:", err);
        // Retorna a mensagem de erro específica do model (inválido ou expirado)
        return res.status(400).json({ mensagem: err.message || "Não foi possível ativar a conta." });
    }
};

export default { verificarContaController };