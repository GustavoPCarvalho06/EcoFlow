import { read, create, update, deleteRecord ,pool} from "../config/database.js";

const getAllComunicados = async () => {
    try {
        const sql = `
            SELECT 
                c.id, c.titulo, c.conteudo, c.data_publicacao,
                u.nome AS autor_nome 
            FROM comunicados c
            JOIN usuarios u ON c.autor_id = u.id
            ORDER BY c.data_publicacao DESC
        `;
        return await read(sql);
    } catch (err) {
        console.error("Erro no model ao buscar comunicados: ", err);
        throw err;
    }
}

const createComunicado = async (data) => {
    try {
       
        return await create("comunicados", data);
    } catch (err) {
        console.error("Erro no model ao criar comunicado: ", err);
        throw err;
    }
}


const updateComunicado = async (id, data) => {
    try {
      
        const dataToUpdate = {
            ...data,
            data_edicao: new Date()
        };
        return await update("comunicados", dataToUpdate, `id = ${id}`);
    } catch (err) { throw err; }
}

const deleteComunicado = async (id) => {
    try {
        return await deleteRecord("comunicados", `id = ${id}`);
    } catch (err) {
        console.error("Erro no model ao deletar comunicado: ", err);
        throw err;
    }
}


const countUnseenComunicados = async (usuarioId) => {
    try {
        const sql = `
            SELECT COUNT(c.id) as unseen_count
            FROM comunicados c
            LEFT JOIN comunicados_vistos cv ON c.id = cv.comunicado_id AND cv.usuario_id = ?
            WHERE
                -- O comunicado nunca foi visto
                cv.comunicado_id IS NULL 
                OR 
                -- O comunicado foi visto, mas editado DEPOIS da data de visualização
                (c.data_edicao IS NOT NULL AND c.data_edicao > cv.data_visualizacao)
        `;
        const result = await read(sql, [usuarioId]);
        return result[0].unseen_count;
    } catch (err) { throw err; }
}

const markAllAsSeen = async (usuarioId) => {
    try {
        const unseen = await getUnseenComunicadoIds(usuarioId);
        if (unseen.length === 0) return 0;
        const values = unseen.map(id => `(${usuarioId}, ${id})`).join(', ');
        const sql_insert = `INSERT IGNORE INTO comunicados_vistos (usuario_id, comunicado_id) VALUES ${values}`;
        const connection = await pool.getConnection(); 
        try {
            const [result] = await connection.execute(sql_insert);
            return result.affectedRows;
        } finally {
            connection.release();
        }
    } catch (err) { throw err; }
}

const markOneAsSeen = async (usuarioId, comunicadoId) => {
    try {
        
        const sql = `
            INSERT INTO comunicados_vistos (usuario_id, comunicado_id, data_visualizacao) 
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE data_visualizacao = NOW()
        `;
        const connection = await pool.getConnection(); 
        try {
            const [result] = await connection.execute(sql, [usuarioId, comunicadoId]);
            return result.affectedRows;
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error("Erro no model ao marcar um comunicado como visto: ", err);
        throw err;
    }
}

const getUnseenComunicadoIds = async (usuarioId) => {
    try {
        const sql = `SELECT id FROM comunicados WHERE id NOT IN (SELECT comunicado_id FROM comunicados_vistos WHERE usuario_id = ?)`;
        const results = await read(sql, [usuarioId]);
        return results.map(row => row.id);
    } catch (err) { throw err; }
}


const getDetailedUnseenIds = async (usuarioId) => {
    try {
        const sql = `
            SELECT c.id, c.data_edicao, cv.data_visualizacao
            FROM comunicados c
            LEFT JOIN comunicados_vistos cv ON c.id = cv.comunicado_id AND cv.usuario_id = ?
            WHERE cv.comunicado_id IS NULL OR (c.data_edicao IS NOT NULL AND c.data_edicao > cv.data_visualizacao)
        `;
        const results = await read(sql, [usuarioId]);
        const new_ids = results.filter(r => r.data_visualizacao === null).map(r => r.id);
        const edited_ids = results.filter(r => r.data_visualizacao !== null).map(r => r.id);
        return { new_ids, edited_ids };
    } catch (err) { throw err; }
}

export { 
    getAllComunicados, 
    createComunicado, 
    updateComunicado, 
    deleteComunicado,
    countUnseenComunicados, 
    markAllAsSeen,
    markOneAsSeen,
    getUnseenComunicadoIds,
    getDetailedUnseenIds
};