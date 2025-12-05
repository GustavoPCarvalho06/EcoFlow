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

const getHistoryStats = async () => {
    try {
        const sql = `
            SELECT 
                DATE_FORMAT(data_hora, '%Y-%m-%d') as data,
                -- Conta comos "Coleta" se o texto disser Vazia
                SUM(CASE WHEN detalhes LIKE '%Vazia%' THEN 1 ELSE 0 END) as coletas,
                
                -- Conta como "Alerta" se o texto disser Cheia ou Quase Cheia
                SUM(CASE WHEN detalhes LIKE '%Cheia%' OR detalhes LIKE '%Quase Cheia%' THEN 1 ELSE 0 END) as alertas
            FROM logs_sistema 
            WHERE data_hora >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            -- AQUI: Adicionei 'CRIACAO_PONTO_COLETA' para contar quando você cria uma lixeira já cheia
            AND (
                acao = 'ATUALIZACAO_SENSOR' 
                OR acao = 'EDICAO_PONTO_COLETA' 
                OR acao = 'CRIACAO_PONTO_COLETA'
            )
            GROUP BY data
            ORDER BY data ASC
        `;
        return await read(sql);
    } catch (err) {
        throw err;
    }
};

export { getLixeirasStats, getColetoresCount,getHistoryStats };