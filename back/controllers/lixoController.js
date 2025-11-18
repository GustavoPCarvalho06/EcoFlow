import { createLixo, updateLixo, deleteLixo } from "../models/lixeiraModels.js";

// Criar
const createLixoController = async (req, res) => {
  try {
    const { statusLixo, localizacao, endereco } = req.body;

    if (!statusLixo || !localizacao || localizacao.x === undefined || localizacao.y === undefined || !endereco) {
      return res.status(400).json({ mensagem: "statusLixo, localizacao e endereco inválidos" });
    }

    if (!["Cheia", "Quase Cheia", "Vazia"].includes(statusLixo)) {
      return res.status(400).json({ mensagem: "statusLixo inválido" });
    }

    await createLixo({ statusLixo, localizacao, endereco });
    return res.status(200).json({ mensagem: "Lixeira criada com sucesso" });

  } catch (err) {
    return res.status(500).json({ mensagem: err.message });
  }
};

// Atualizar
const updateLixoController = async (req, res) => {
  try {
    const { id, statusLixo } = req.body;
    if (!id) {
      return res.status(400).json({ mensagem: "id não fornecido" });
    }

    const resultado = await updateLixo({ statusLixo }, id);
    return res.status(200).json({ mensagem: resultado });
  } catch (err) {
    console.error("Erro ao atualizar lixeira:", err);
    return res.status(500).json({ mensagem: "Erro interno ao atualizar a lixeira." });
  }
};

// Deletar
const deleteLixoController = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ mensagem: "id não fornecido" });
    }

    const resultado = await deleteLixo(id);
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
