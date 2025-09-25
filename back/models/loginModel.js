import { read } from "../config/database.js";

// Buscar usuário pelo CPF
const findUserByCpf = async (cpf) => {
  try {
    const usuario = await read("usuarios", `cpf = '${cpf}'`);
    if (!usuario || usuario.length === 0) {
      return null;
    }
    return usuario[0];
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    throw err;
  }
};

export { findUserByCpf };
