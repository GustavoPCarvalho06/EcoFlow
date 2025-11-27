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

        // --- LÓGICA DE PESQUISA CORRIGIDA ---
        if (search && search.trim() !== '') {
            const term = `%${search.trim()}%`;
            
            // Tenta extrair apenas números para buscar no CPF
            const numbersOnly = search.replace(/\D/g, '');
            const termCpf = numbersOnly.length > 0 ? `%${numbersOnly}%` : null;

            // Monta as condições de busca dinamicamente
            let searchConditions = [
                `l.nome_usuario LIKE ?`, // Nome gravado no log
                `u.nome LIKE ?`,         // Nome atual do usuário
                `u.email LIKE ?`,        // Email
                `l.detalhes LIKE ?`      // Detalhes da ação
            ];
            
            // Adiciona os parametros para as 4 condições acima
            params.push(term, term, term, term);

            // Se o usuário digitou números, adicionamos a busca por CPF
            if (termCpf) {
                searchConditions.push(`u.cpf LIKE ?`);
                params.push(termCpf);
            }

            // Concatena tudo com OR dentro de parenteses
            whereClause += ` AND (${searchConditions.join(' OR ')})`;
        }

        // --- FILTROS DE AÇÃO ---
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

        // --- QUERY PRINCIPAL ---
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

        // Adiciona limit e offset aos parâmetros finais
        const dataParams = [...params, limitNum, offset];
        const logs = await read(sqlData, dataParams);

        // --- QUERY DE CONTAGEM (Para paginação) ---
        const sqlCount = `
            SELECT COUNT(*) as total
            FROM logs_sistema l
            LEFT JOIN usuarios u ON l.usuario_id = u.id
            ${whereClause}
        `;
        
        // Para o count, usamos apenas os params do filtro (sem limit/offset)
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