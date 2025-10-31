// controllers/msgController.js (VERSÃO CORRIGIDA E FOCADA EM MENSAGENS)

import { getConversa } from "../models/MensagemModel.js";

const getHistoricoConversaController = async (req, res) => {
  try {
    // ID do outro usuário com quem se está conversando (vem da URL)
    const outroUsuarioId = req.params.outroUsuarioId;

    // ID do usuário que está logado (deve ser injetado por um middleware de autenticação)
    // ATENÇÃO: req.user.id é um exemplo. Você precisará de um middleware
    // de autenticação (JWT, por exemplo) para popular isso.
    const meuId = req.user.id; 

    if (!outroUsuarioId || !meuId) {
      return res.status(400).json({ mensagem: "IDs dos usuários são obrigatórios." });
    }

    // Chama a função do model para buscar o histórico da conversa
    const historico = await getConversa(meuId, outroUsuarioId);

    return res.status(200).json(historico);

  } catch (err) {
    console.error("Erro no controller ao buscar histórico de conversa: ", err);
    return res.status(500).json({ mensagem: "Erro interno ao buscar o histórico da conversa." });
  }
};

export default { getHistoricoConversaController };