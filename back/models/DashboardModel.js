// =================================================================================
// Arquivo: back/models/DashboardModel.js
// =================================================================================

import { read } from "../config/database.js";

// Busca o total de lixeiras agrupadas por status
const getLixeirasStats = async () => {
    try {
        const sql = `
            SELECT 
                statusLixo, 
                COUNT(*) as total 
            FROM SistemaSensor 
            GROUP BY statusLixo
        `;
        return await read(sql);
    } catch (err) {
        throw err;
    }
};

// Busca o total de usuários que são coletores
const getColetoresCount = async () => {
    try {
        const sql = `
            SELECT COUNT(*) as total 
            FROM usuarios 
            WHERE cargo = 'coletor' AND statusConta = 'ativo'
        `;
        const res = await read(sql);
        return res[0].total;
    } catch (err) {
        throw err;
    }
};

export { getLixeirasStats, getColetoresCount };