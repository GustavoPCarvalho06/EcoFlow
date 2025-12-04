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

export { getLixeirasStats, getColetoresCount };