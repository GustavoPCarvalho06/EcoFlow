// controllers/LoginController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { findUserByCpf } from "../models/loginModel.js";
import { JWT_SECRET } from "../config/jwt.js";
import { registrarLog } from "../models/LogModel.js";

const login = async (req, res) => {
  try {
    const { cpf, senha } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const user = await findUserByCpf(cpf);
    


    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    if (user.statusConta === "desligado") {
      return res
        .status(403)
        .json({ erro: "Sua conta está desativada. Contate o suporte." });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha inválida." });
    }

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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 3600000, 
    });


     await registrarLog({
        usuario_id: user.id,
        nome_usuario: user.nome,
        cargo_usuario: user.cargo,
        acao: 'LOGIN',
        detalhes: `O usuário ${user.nome} realizou login no sistema.`,
        ip: ip
    });

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
