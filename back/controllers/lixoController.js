import { createLixo, updateLixo, deleteLixo } from "../models/lixeiraModels.js";
import { registrarLog } from "../models/LogModel.js";

const createLixoController = async (req, res) => {
  try {
    const { statusLixo, localizacao, endereco } = req.body;
    
    const usuarioLogado = req.user;

    if (!statusLixo || !localizacao || localizacao.x === undefined || localizacao.y === undefined || !endereco) {
      return res.status(400).json({ mensagem: "statusLixo, localizacao e endereco inválidos" });
    }

    if (!["Cheia", "Quase Cheia", "Vazia"].includes(statusLixo)) {
      return res.status(400).json({ mensagem: "statusLixo inválido" });
    }

    await createLixo({ statusLixo, localizacao, endereco });

    if (usuarioLogado) {
      await registrarLog({
        usuario_id: usuarioLogado.id,
        nome_usuario: usuarioLogado.nome,
        cargo_usuario: usuarioLogado.cargo,
        acao: 'CRIACAO_PONTO_COLETA',
        detalhes: `Criou um novo ponto de coleta em: ${endereco} (Status inicial: ${statusLixo})`,
        ip: req.ip
      });
    }
    

    return res.status(200).json({ mensagem: "Lixeira criada com sucesso" });

  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};


const updateLixoController = async (req, res) => {
  try {
    const { id, statusLixo } = req.body;
    
    const usuarioLogado = req.user;

    if (!id) {
      return res.status(400).json({ mensagem: "id não fornecido" });
    }

    const resultado = await updateLixo({ statusLixo }, id);

    if (usuarioLogado) {
      await registrarLog({
        usuario_id: usuarioLogado.id,
        nome_usuario: usuarioLogado.nome,
        cargo_usuario: usuarioLogado.cargo,
        acao: 'EDICAO_PONTO_COLETA',
        detalhes: `Atualizou o status do ponto ID ${id} para: "${statusLixo}"`,
        ip: req.ip
      });
    }
   

    return res.status(200).json({ mensagem: resultado });
  } catch (err) {
    console.error("Erro ao atualizar lixeira:", err);
    return res.status(500).json({ mensagem: "Erro interno ao atualizar a lixeira." });
  }
};

const deleteLixoController = async (req, res) => {
  try {
    const { id } = req.body;
    
    const usuarioLogado = req.user;

    if (!id) {
      return res.status(400).json({ mensagem: "id não fornecido" });
    }

    const resultado = await deleteLixo(id);

    if (usuarioLogado) {
      await registrarLog({
        usuario_id: usuarioLogado.id,
        nome_usuario: usuarioLogado.nome,
        cargo_usuario: usuarioLogado.cargo,
        acao: 'EXCLUSAO_PONTO_COLETA',
        detalhes: `Removeu o ponto de coleta ID ${id}`,
        ip: req.ip
      });
    }
    

    return res.status(200).json({ mensagem: "Lixeira deletada com sucesso", resultado });
  } catch (err) {
    console.error("Erro ao deletar lixeira:", err);
    return res.status(500).json({ mensagem: "Erro interno ao deletar a lixeira." });
  }
};

export default {
  createLixoController,
  updateLixoController,
  deleteLixoController,
};