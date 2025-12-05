import { read } from "../config/database.js";

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

const getHistoryStats = async (range = 'semanal') => {
    try {
        let condition = "";
        let dateFormat = "";
        let groupBy = "";

        if (range === 'mensal') {
            
            condition = "data_hora >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
            dateFormat = "%Y-%m-%d"; 
            groupBy = "data";
        } else if (range === 'anual') {
           
            condition = "data_hora >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)";
            dateFormat = "%Y-%m"; 
            groupBy = "data";
        } else {
            
            condition = "data_hora >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)";
            dateFormat = "%Y-%m-%d";
            groupBy = "data";
        }

        const sql = `
            SELECT 
                DATE_FORMAT(data_hora, '${dateFormat}') as data,
                -- Conta Coletas (Vazia)
                SUM(CASE WHEN detalhes LIKE '%Vazia%' THEN 1 ELSE 0 END) as coletas,
                
                -- Conta Alertas (Cheia/Quase Cheia) + Criação já cheia
                SUM(CASE WHEN detalhes LIKE '%Cheia%' OR detalhes LIKE '%Quase Cheia%' THEN 1 ELSE 0 END) as alertas
            FROM logs_sistema 
            WHERE ${condition}
            AND (
                acao = 'ATUALIZACAO_SENSOR' 
                OR acao = 'EDICAO_PONTO_COLETA' 
                OR acao = 'CRIACAO_PONTO_COLETA'
            )
            GROUP BY ${groupBy}
            ORDER BY data ASC
        `;
        return await read(sql);
    } catch (err) {
        throw err;
    }
};

export { getLixeirasStats, getColetoresCount,getHistoryStats };