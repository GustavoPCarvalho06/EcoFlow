// controllers/ComunicadoController.js (VERSÃO ATUALIZADA)

import { getAllComunicados, createComunicado, updateComunicado,
     deleteComunicado ,countUnseenComunicados, markAllAsSeen,markOneAsSeen ,
     getUnseenComunicadoIds,getDetailedUnseenIds} from "../models/ComunicadoModel.js";

const getAllComunicadosController = async (req, res) => {
  try {
    const comunicados = await getAllComunicados();
    return res.status(200).json(comunicados);
  } catch (err) {
    console.error("Erro no controller ao buscar comunicados: ", err);
    return res.status(500).json({ mensagem: "Erro interno ao buscar comunicados." });
  }
};
const createComunicadoController = async (req, res) => {
    try {
        const { titulo, conteudo, autor_id } = req.body;
        if (!titulo || !conteudo || !autor_id) return res.status(400).json({ mensagem: "Dados insuficientes." });
        
        // 1. Cria o comunicado e pega o ID dele
        const newComunicadoId = await createComunicado({ titulo, conteudo, autor_id });

        // 2. [LÓGICA NOVA] Marca imediatamente como visto pelo próprio autor
        if (newComunicadoId) {
            await markOneAsSeen(autor_id, newComunicadoId);
        }
        
        // 3. Emite o evento global para todos os outros
        req.io.emit('comunicados_atualizados');
        
        return res.status(201).json({ mensagem: "Comunicado criado com sucesso." });
    } catch (err) {
        console.error("Erro no controller ao criar comunicado: ", err);
        return res.status(500).json({ mensagem: "Erro interno." });
    }
};

const updateComunicadoController = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, conteudo } = req.body;
        const autor_id = req.headers['x-user-id']; // Assumindo que o autor da edição é o usuário logado

        if (!titulo && !conteudo) return res.status(400).json({ mensagem: "Pelo menos um campo é necessário." });
        if (!autor_id) return res.status(401).json({ mensagem: "Usuário não autenticado." });
        
        // 1. Atualiza o comunicado
        await updateComunicado(id, { titulo, conteudo });

        // 2. [LÓGICA NOVA] Marca como visto/re-visto pelo editor
        await markOneAsSeen(autor_id, id);

        // 3. Emite o evento global
        req.io.emit('comunicados_atualizados');
        
        return res.status(200).json({ mensagem: "Comunicado atualizado com sucesso." });
    } catch (err) {
        console.error("Erro no controller ao atualizar comunicado: ", err);
        return res.status(500).json({ mensagem: "Erro interno." });
    }
};

const deleteComunicadoController = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteComunicado(id);

        // [NOVO] Emite o mesmo evento após deletar
        req.io.emit('comunicados_atualizados');

        return res.status(200).json({ mensagem: "Comunicado deletado com sucesso." });
    } catch (err) {
        console.error("Erro no controller ao deletar comunicado: ", err);
        return res.status(500).json({ mensagem: "Erro interno ao deletar comunicado." });
    }
};

// [NOVO] Controller para contar comunicados não vistos
const countUnseenController = async (req, res) => {
    try {
        const usuarioId = req.headers['x-user-id'];
        if (!usuarioId) {
            return res.status(400).json({ mensagem: "ID do usuário é obrigatório." });
        }
        const count = await countUnseenComunicados(usuarioId);
        return res.status(200).json({ count });
    } catch (err) {
        console.error("Erro no controller ao contar não vistos: ", err);
        return res.status(500).json({ mensagem: "Erro interno." });
    }
};

// [NOVO] Controller para marcar todos como vistos
const markAllSeenController = async (req, res) => {
    try {
        const usuarioId = req.headers['x-user-id'];
        if (!usuarioId) {
            return res.status(400).json({ mensagem: "ID do usuário é obrigatório." });
        }
        await markAllAsSeen(usuarioId);
        return res.status(200).json({ mensagem: "Comunicados marcados como vistos." });
    } catch (err) {
        console.error("Erro no controller ao marcar como vistos: ", err);
        return res.status(500).json({ mensagem: "Erro interno." });
    }
};


const markOneSeenController = async (req, res) => {
    try {
        const usuarioId = req.headers['x-user-id'];
        const { comunicadoId } = req.params; // Pega o ID do comunicado da URL

        if (!usuarioId || !comunicadoId) {
            return res.status(400).json({ mensagem: "ID do usuário e do comunicado são obrigatórios." });
        }
        await markOneAsSeen(usuarioId, comunicadoId);
        
        // [IMPORTANTE] Avisa a todos que a contagem de alguém pode ter mudado
        req.io.emit('comunicados_atualizados');

        return res.status(200).json({ mensagem: "Comunicado marcado como visto." });
    } catch (err) {
        console.error("Erro no controller ao marcar um como visto: ", err);
        return res.status(500).json({ mensagem: "Erro interno." });
    }
};

const getUnseenIdsController = async (req, res) => {
    try {
        const usuarioId = req.headers['x-user-id'];
        if (!usuarioId) return res.status(400).json({ mensagem: "ID do usuário é obrigatório." });

        const unseen_ids = await getUnseenComunicadoIds(usuarioId);
        return res.status(200).json({ unseen_ids });
    } catch (err) {
        // ... tratamento de erro
    }
};

const getDetailedUnseenIdsController = async (req, res) => {
    try {
        const usuarioId = req.headers['x-user-id'];
        if (!usuarioId) return res.status(400).json({ mensagem: "ID do usuário é obrigatório." });
        const ids = await getDetailedUnseenIds(usuarioId);
        return res.status(200).json(ids);
    } catch (err) {
        console.error("Erro no controller ao buscar IDs detalhados não vistos: ", err);
        return res.status(500).json({ mensagem: "Erro interno." });
    }
};

export default { 
    getAllComunicadosController, 
    createComunicadoController, 
    updateComunicadoController, 
    deleteComunicadoController ,
    countUnseenController, // [NOVO]
    markAllSeenController,
    markOneSeenController,
    getUnseenIdsController,
    getDetailedUnseenIdsController
};