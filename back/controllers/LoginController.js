// controllers/LoginController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { findUserByCpf } from "../models/loginModel.js";
import { JWT_SECRET } from "../config/jwt.js";

const login = async (req, res) => {
  try {
    const { cpf, senha } = req.body;

    // Busca o usuário pelo CPF direto (sem base64)
    const user = await findUserByCpf(cpf);
    console.log("Usuário encontrado:", user);

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    if (user.statusConta === "desligado") {
      return res
        .status(403)
        .json({ erro: "Sua conta está desativada. Contate o suporte." });
    }

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha inválida." });
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        id: user.id,
        cpf: user.cpf,
        cargo: user.cargo,
        nome: user.nome,
        email: user.email,
        sexo: user.sexo,
        estadoCivil: user.estadoCivil,
        CEP: user.CEP,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Define o cookie do token de autenticação
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 3600000, // 1 hora
    });

    // Retorna resposta de sucesso
    return res.status(200).json({
      message: "Login realizado com sucesso!",
      user: {
        id: user.id,
        nome: user.nome,
        cargo: user.cargo,
        token,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
};

export { login };
