import { read } from "../config/database.js";


const findUserByCpf = async (cpf) => {
  try {
  
    const sql = "SELECT * FROM usuarios WHERE cpf = ?";

    const params = [cpf];

    const usuario = await read(sql, params);

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
