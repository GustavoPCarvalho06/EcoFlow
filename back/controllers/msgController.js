import { getConversa, getUnreadCountsForUser, markMessagesAsRead } from "../models/MensagemModel.js";

const getHistoricoConversaController = async (req, res) => {
  try {
 
    const outroUsuarioId = req.params.outroUsuarioId;

    const meuId = req.headers['x-user-id'];
    
    if (!outroUsuarioId || !meuId) {
      return res.status(400).json({ mensagem: "IDs dos usuários são obrigatórios." });
    }

    const historico = await getConversa(meuId, outroUsuarioId);

    return res.status(200).json(historico);

  } catch (err) {
    console.error("Erro no controller ao buscar histórico de conversa: ", err);
    return res.status(500).json({ mensagem: "Erro interno ao buscar o histórico da conversa." });
  }
};

const getUnreadCountsController = async (req, res) => {
  try {
    const meuId = req.headers['x-user-id'];
    if (!meuId) {
      return res.status(400).json({ mensagem: "ID do usuário é obrigatório." });
    }
    const counts = await getUnreadCountsForUser(meuId);
    return res.status(200).json(counts);
  } catch (err) {
    console.error("Erro no controller ao buscar contagens: ", err);
    return res.status(500).json({ mensagem: "Erro interno ao buscar contagens." });
  }
};

const markAsReadController = async (req, res) => {
  try {
    const meuId = req.headers['x-user-id'];
    const remetenteId = req.params.remetenteId;
    if (!meuId || !remetenteId) {
      return res.status(400).json({ mensagem: "IDs dos usuários são obrigatórios." });
    }
    await markMessagesAsRead(meuId, remetenteId);
    return res.status(200).json({ mensagem: "Mensagens marcadas como lidas." });
  } catch (err) {
    console.error("Erro no controller ao marcar como lido: ", err);
    return res.status(500).json({ mensagem: "Erro interno ao marcar mensagens como lidas." });
  }
};

export default { getHistoricoConversaController, getUnreadCountsController, markAsReadController };