import { read, readAll, deleteRecord, create, update ,createLixoDB} from "../config/database.js";

// 🗑️ Deletar Lixeira
const deleteLixo = async (id) => {
  try {
    const usuario = await deleteRecord("SistemaSensor", `id_Sensor = '${id}'`);
    if (!usuario) {
      return "Erro ao consultar";
    }
    return usuario;
  } catch (err) {
    console.error("Erro ao consultar a Lixeira no sistema:", err);
    throw err;
  }
};

// 🧱 Criar Lixeira (com POINT)
const createLixo = async (data) => {
  try {
    const { statusLixo, localizacao } = data;

    if (!statusLixo || !localizacao || !localizacao.x || !localizacao.y) {
      throw new Error("Campos statusLixo e localizacao são obrigatórios");
    }

    // Cria o POINT no formato SQL
    const point = `ST_GeomFromText('POINT(${localizacao.x} ${localizacao.y})')`;

    // Objeto com dados
    const dataUsuario = {
      statusLixo,
      localizacao: point,
    };

    // Envia o comando de criação
    await createLixoDB("SistemaSensor", dataUsuario, true); // ⚠️ Passe true se sua função create() não usa prepared statements
    return "Lixeira criada com sucesso";
  } catch (err) {
    console.error("Houve um erro ao criar a Lixeira:", err);
    throw err;
  }
};

// ♻️ Atualizar Lixeira
const updateLixo = async (data, id) => {
  try {
    const conteudo = {
      statusLixo: data.statusLixo,
    };

    await update("SistemaSensor", conteudo, `id_Sensor = '${id}'`);
    return "Lixeira atualizada com sucesso";
  } catch (err) {
    console.error("Erro ao atualizar Lixeira:", err);
    throw err;
  }
};

export { createLixo, updateLixo, deleteLixo };
