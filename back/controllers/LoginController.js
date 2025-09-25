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
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: user.id_login, cpf: user.cpf, cargo: user.cargo },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ erro: "Erro no login" });
  }
};

export { login };
