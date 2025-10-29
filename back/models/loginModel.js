import { read } from "../config/database.js";


// Buscar usuário pelo CPF (VERSÃO CORRIGIDA)
const findUserByCpf = async (cpf) => {
  try {
    // 1. Define a query SQL completa com um placeholder (?)
    const sql = "SELECT * FROM usuarios WHERE cpf = ?";

    // 2. Coloca o valor do CPF em um array
    const params = [cpf];

    // 3. Chama a função 'read' com os argumentos corretos
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
