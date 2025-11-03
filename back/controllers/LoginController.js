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
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    if (user.statusConta === "desligado") {
      return res.status(403).json({ erro: "Sua conta está desativada. Por favor, entre em contato com o suporte." });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    const emailValido = await bcrypt.compare(user.email);


    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: user.id, cpf: user.cpf, cargo: user.cargo, nome: user.nome, email:emailValido, sexo: user.sexo,estadoCivil: user.estadoCivil, CEP: user.CEP,},
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // --- COOKIES ---
    // Define o cookie do token de autenticação
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax', // Ou 'Strict' para mais segurança
      maxAge: 3600000 // 1 hora
    });

    // >>> ADICIONE ESTA LINHA PARA CRIAR O COOKIE DE PERFIL <<<
    res.cookie('perfil', user.cargo, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 3600000 // 1 hora
    });
    // ---------------

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      user: {
        id: user.id,  
        nome: user.nome,
        cargo: user.cargo,
        token:token
      }
    });


  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
};

export { login };