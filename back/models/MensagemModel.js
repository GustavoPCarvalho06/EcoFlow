// models/MensagemModel.js

import { create, read } from "../config/database.js";

// Função para criar uma nova mensagem e retorná-la
const createMensagem = async (data) => {
  try {
    const id = await create("mensagens", data);
    
    // Após inserir, buscamos a mensagem completa para retornar ao cliente
    const sql = `
      SELECT m.*, u_remetente.nome AS remetente_nome 
      FROM mensagens m
      JOIN usuarios u_remetente ON m.remetente_id = u_remetente.id
      WHERE m.id = ?
    `;
    const [mensagemCompleta] = await read(sql, [id]);
    
    return mensagemCompleta;
  } catch (err) {
    console.error("Erro no model ao criar mensagem: ", err);
    throw err;
  }
};

// Função para buscar o histórico de uma conversa entre dois usuários
const getConversa = async (usuario1Id, usuario2Id) => {
    try {
        const sql = `
            SELECT m.*, u_remetente.nome AS remetente_nome
            FROM mensagens m
            JOIN usuarios u_remetente ON m.remetente_id = u_remetente.id
            WHERE 
                (remetente_id = ? AND destinatario_id = ?) OR 
                (remetente_id = ? AND destinatario_id = ?)
            ORDER BY data_envio ASC
        `;
        const params = [usuario1Id, usuario2Id, usuario2Id, usuario1Id];
        const conversa = await read(sql, params);
        return conversa;
    } catch (err) {
        console.error("Erro no model ao buscar conversa: ", err);
        throw err;
    }
}

export { createMensagem, getConversa };