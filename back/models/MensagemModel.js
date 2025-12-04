import { create, read, pool  } from "../config/database.js";

const createMensagem = async (data) => {
  try {
    const id = await create("mensagens", data);
    
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

const getUnreadCountsForUser = async (destinatarioId) => {
  try {
    const sql = `
      SELECT remetente_id, COUNT(*) as count
      FROM mensagens
      WHERE destinatario_id = ? AND status_leitura = 0
      GROUP BY remetente_id
    `;
    const results = await read(sql, [destinatarioId]);
    
    const counts = results.reduce((acc, row) => {
      acc[row.remetente_id] = row.count;
      return acc;
    }, {});

    return counts;
  } catch (err) {
    console.error("Erro no model ao buscar contagem de não lidas: ", err);
    throw err;
  }
}

const markMessagesAsRead = async (destinatarioId, remetenteId) => {
  try {
    const sql = `
      UPDATE mensagens 
      SET status_leitura = 1 
      WHERE destinatario_id = ? AND remetente_id = ? AND status_leitura = 0
    `;
     const connection = await pool.getConnection(); 
    try {
        const [result] = await connection.execute(sql, [destinatarioId, remetenteId]);
        return result.affectedRows;
    } finally {
        connection.release();
    }
  } catch (err) {
    console.error("Erro no model ao marcar mensagens como lidas: ", err);
    throw err;
  }
}


export { createMensagem, getConversa, getUnreadCountsForUser, markMessagesAsRead };