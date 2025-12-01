// =================================================================================
// Arquivo: back/models/LogModel.js
// =================================================================================

import { create, read } from "../config/database.js";

const registrarLog = async ({ usuario_id, nome_usuario, cargo_usuario, acao, detalhes, ip }) => {
    try {
        const data = {
            usuario_id,
            nome_usuario,
            cargo_usuario,
            acao,
            detalhes,
            ip_origem: ip || '::1'
        };
        await create("logs_sistema", data);
    } catch (err) {
        console.error("Erro ao gravar log:", err);
    }
};

const getLogsPaginated = async ({ page = 1, limit = 10, search = '', acao = '' }) => {
    try {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        const params = [];
        let whereClause = "WHERE 1=1"; 

        // --- 1. LÓGICA DE PESQUISA (Busca por texto) ---
        if (search && search.trim() !== '') {
            const term = `%${search.trim()}%`;
            const numbersOnly = search.replace(/\D/g, '');
            const termCpf = numbersOnly.length > 0 ? `%${numbersOnly}%` : null;

            let searchConditions = [
                `l.nome_usuario LIKE ?`,
                `u.nome LIKE ?`,
                `u.email LIKE ?`,
                `l.detalhes LIKE ?`
            ];
            
            params.push(term, term, term, term);

            if (termCpf) {
                searchConditions.push(`u.cpf LIKE ?`);
                params.push(termCpf);
            }

            whereClause += ` AND (${searchConditions.join(' OR ')})`;
        }

        // --- 2. LÓGICA DE FILTROS CORRIGIDA ---
        
        if (acao === 'IOT') {
            // CASO 1: Se o usuário selecionou "IoT", mostra APENAS IoT
            whereClause += ` AND l.cargo_usuario = 'IoT'`;
        } else {
            // CASO 2: Para qualquer outro caso (padrão 'todos', LOGIN, CRIAR...), ESCONDE IoT
            // A condição (l.cargo_usuario != 'IoT' OR l.cargo_usuario IS NULL) garante que IoT suma
            whereClause += ` AND (l.cargo_usuario != 'IoT' OR l.cargo_usuario IS NULL)`;

            // Aplica os outros filtros de ação se necessário
            if (acao && acao !== 'todos') {
                if (acao === 'CRIAR') {
                    whereClause += ` AND (l.acao LIKE '%CRIACAO%' OR l.acao LIKE '%ADD%')`;
                } else if (acao === 'EDITAR') {
                    whereClause += ` AND (l.acao LIKE '%EDICAO%' OR l.acao LIKE '%UPDATE%' OR l.acao LIKE '%FUNCAO%')`;
                } else if (acao === 'DELETAR') {
                    whereClause += ` AND (l.acao LIKE '%EXCLUSAO%' OR l.acao LIKE '%DELET%' OR l.acao LIKE '%DESLIGAMENTO%' OR l.acao LIKE '%ATIVACAO%')`;
                } else if (acao === 'LOGIN') {
                    whereClause += ` AND l.acao = 'LOGIN'`;
                } else {
                    whereClause += ` AND l.acao = ?`;
                    params.push(acao);
                }
            }
        }

        // --- 3. QUERY DE DADOS ---
        const sqlData = `
            SELECT 
                l.*, 
                u.email as autor_email, 
                u.cpf as autor_cpf,
                u.nome as autor_nome_atual,
                u.statusConta as autor_status
            FROM logs_sistema l
            LEFT JOIN usuarios u ON l.usuario_id = u.id
            ${whereClause}
            ORDER BY l.data_hora DESC
            LIMIT ? OFFSET ?
        `;

        const dataParams = [...params, limitNum, offset];
        const logs = await read(sqlData, dataParams);

        // --- 4. QUERY DE CONTAGEM ---
        const sqlCount = `
            SELECT COUNT(*) as total
            FROM logs_sistema l
            LEFT JOIN usuarios u ON l.usuario_id = u.id
            ${whereClause}
        `;
        
        const [countResult] = await read(sqlCount, params);
        const total = countResult ? countResult.total : 0;

        return {
            data: logs,
            total: total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum) || 1
        };

    } catch (err) {
        console.error("Erro no model ao buscar logs paginados:", err);
        throw err;
    }
};

export { registrarLog, getLogsPaginated };