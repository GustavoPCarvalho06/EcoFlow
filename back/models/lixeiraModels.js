import { read, readAll, deleteRecord, create, update ,createLixoDB} from "../config/database.js";

const deleteLixo = async (id) => {
  try {

    try {
        await deleteRecord("historico_sensores", `id_sensor = '${id}'`);
    } catch (e) {
 
        console.log("Aviso: Tentativa de limpar histórico retornou:", e.message);
    }

    const resultado = await deleteRecord("SistemaSensor", `id_Sensor = '${id}'`);
    
    if (!resultado) {
      return "Erro ao consultar ou sensor não encontrado";
    }
    return resultado;
  } catch (err) {
    console.error("Erro ao deletar a Lixeira no sistema:", err);
    throw err;
  }
};

const createLixo = async (data) => {
  try {
    const { statusLixo, localizacao, endereco } = data;

    if (!statusLixo || !localizacao || !localizacao.x || !localizacao.y || !endereco) {
      throw new Error("Campos statusLixo, localizacao e endereço são obrigatórios");
    }

    const point = `ST_GeomFromText('POINT(${localizacao.x} ${localizacao.y})')`;

    const dataUsuario = {
      statusLixo,
      localizacao: point,
      endereco,
    };

    await createLixoDB("SistemaSensor", dataUsuario, true);
    return "Lixeira criada com sucesso";
  } catch (err) {
    console.error("Houve um erro ao criar a Lixeira:", err);
    throw err;
  }
};

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
