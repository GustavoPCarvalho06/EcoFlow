// controllers/LoginController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { findUserByCpf } from "../models/loginModel.js";
import { JWT_SECRET } from "../config/jwt.js";


// Controller de login
const login = async (req, res) => {
  
  try {
    const { cpf, senha } = req.body;
    const cpfValido = Buffer.from(cpf, "utf8").toString("base64");
    console.log(cpfValido);
    
    const criptoUser = await findUserByCpf(cpfValido);
    console.log("usuario logado", criptoUser);

    const user = Object.fromEntries(
      Object.entries(criptoUser).map(([key, value]) => {
        // só tenta decodificar se for string e não for hash da senha
        if (typeof value === "string" && value !== criptoUser.senha && value !== criptoUser.statusConta) {
          try {
            return [key, Buffer.from(value, "base64").toString("utf8")];
          } catch {
            return [key, value]; // se não for base64 válido, mantém original
          }
        }
        return [key, value];
      })
    );
    console.log ("usuario logado 2: ", user);

    if (!user) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    if (user.statusConta === "desligado") {
      return res.status(403).json({ erro: "Sua conta está desativada. Por favor, entre em contato com o suporte." });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
      
    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: user.id, cpf: user.cpf, cargo: user.cargo, nome: user.nome, email:user.email, sexo: user.sexo, estadoCivil: user.estadoCivil, CEP: user.CEP,},
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