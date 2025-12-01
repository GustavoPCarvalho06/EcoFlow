import { findUserByCpfWithEmail, saveRecoveryCode, findUserByCpfAndCode, updatePasswordByCpf } from '../models/UserModels.js';
import { sendRecoveryEmail } from '../config/mailer.js';
import crypto from 'crypto'; 

const enviarCodigoController = async (req, res) => {
    try {
        const { cpf } = req.body;
        const cleanCpf = cpf.replace(/\D/g, '');

        const user = await findUserByCpfWithEmail(cleanCpf);
        if (!user) {
            return res.status(404).json({ mensagem: "CPF não encontrado em nosso sistema." });
        }

        const codigo = crypto.randomInt(100000, 999999).toString();
        const expiracao = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos a partir de agora

        await saveRecoveryCode(cleanCpf, codigo, expiracao);
        await sendRecoveryEmail(user.email, codigo);

        return res.status(200).json({ mensagem: "Código de recuperação enviado para o e-mail cadastrado." });

    } catch (err) {
        console.error("Erro no controller ao enviar código:", err);
        return res.status(500).json({ mensagem: err.message || "Erro interno ao processar a solicitação." });
    }
};

const verificarCodigoController = async (req, res) => {
    try {
        const { cpf, codigo } = req.body;
        const cleanCpf = cpf.replace(/\D/g, '');

        const user = await findUserByCpfAndCode(cleanCpf, codigo);
        if (!user) {
            return res.status(400).json({ mensagem: "Código inválido ou expirado. Tente novamente." });
        }

        return res.status(200).json({ mensagem: "Código verificado com sucesso!" });

    } catch (err) {
        console.error("Erro no controller ao verificar código:", err);
        return res.status(500).json({ mensagem: "Erro interno ao verificar o código." });
    }
};

const redefinirSenhaController = async (req, res) => {
    try {
        const { cpf, codigo, novaSenha } = req.body;
        if (!novaSenha || novaSenha.length < 6) {
            return res.status(400).json({ mensagem: "A nova senha deve ter pelo menos 6 caracteres." });
        }
        
        const cleanCpf = cpf.replace(/\D/g, '');

        const user = await findUserByCpfAndCode(cleanCpf, codigo);
        if (!user) {
            return res.status(400).json({ mensagem: "Código inválido. A redefinição não pode continuar." });
        }

        await updatePasswordByCpf(cleanCpf, novaSenha);

        return res.status(200).json({ mensagem: "Senha redefinida com sucesso! Você já pode fazer login." });

    } catch (err) {
        console.error("Erro no controller ao redefinir senha:", err);
        return res.status(500).json({ mensagem: "Erro interno ao redefinir a senha." });
    }
};

export default { enviarCodigoController, verificarCodigoController, redefinirSenhaController };