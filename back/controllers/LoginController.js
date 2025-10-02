// controllers/LoginController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { findUserByCpf } from "../models/loginModel.js";
import { JWT_SECRET } from "../config/jwt.js";

// Controller de login
const login = async (req, res) => {
  try {
    const { cpf, senha } = req.body;

    const user = await findUserByCpf(cpf);
    if (!user) {
      // GARANTA que este JSON está sendo enviado
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // --- Verificação do statusConta ---
    if (user.statusConta === "desligado") {
      // GARANTA que este JSON está sendo enviado
      return res.status(403).json({ erro: "Sua conta está desativada. Por favor, entre em contato com o suporte." });
    }
    // ------------------------------------

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      // GARANTA que este JSON está sendo enviado
      return res.status(401).json({ erro: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: user.id_login, cpf: user.cpf, cargo: user.cargo },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 3600000
    });

    // Em caso de sucesso, também é bom enviar um JSON.
    // Assim, o frontend sempre espera um JSON.
    return res.status(200).json({ mensagem: "Login realizado com sucesso!" });

  } catch (err) {
    console.error("Erro no login:", err);
    // GARANTA que este JSON está sendo enviado para erros internos do servidor
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
};

export { login };