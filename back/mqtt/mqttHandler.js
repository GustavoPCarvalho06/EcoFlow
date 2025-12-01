import { updateLixo } from "../models/lixeiraModels.js";
import { registrarLog } from "../models/LogModel.js";
import { read } from "../config/database.js"; // [NOVO] Importar read para buscar o endereço

export const handleMqttMessage = async (topic, payload, io) => {
  try {
    const mensagemString = payload.toString();
    console.log(`[MQTT] Mensagem:`, mensagemString);

    let dados;
    try {
      dados = JSON.parse(mensagemString);
    } catch (e) {
      console.error("[MQTT] JSON inválido.");
      return;
    }

    if (topic === "ecoflow/sensor/atualizar") {
      const { id, status } = dados;

      if (!id || !status) return;

      // 1. Atualiza o Status
      await updateLixo({ statusLixo: status }, id);

      // [NOVO] 2. Busca o endereço do sensor para colocar no Log
      let localizacaoTexto = "Local desconhecido";
      try {
        // Ajuste o nome da tabela e coluna conforme seu banco (supondo SistemaSensor e id_Sensor)
        const sql = "SELECT endereco FROM SistemaSensor WHERE id_Sensor = ?"; 
        const resultado = await read(sql, [id]);
        if (resultado && resultado.length > 0) {
          localizacaoTexto = resultado[0].endereco;
        }
      } catch (err) {
        console.error("Erro ao buscar endereço do sensor:", err);
      }

      // 3. Registra o Log com o Endereço
      await registrarLog({
        usuario_id: null,
        nome_usuario: "Sensor IoT", // Nome fixo para identificar
        cargo_usuario: "IoT",       // Cargo fixo para o filtro funcionar
        acao: "ATUALIZACAO_SENSOR",
        detalhes: `Sensor ID ${id} em [${localizacaoTexto}] mudou para: ${status}`,
        ip: "MQTT"
      });

      io.emit("sensor_atualizado", { id, status });
    }

  } catch (err) {
    console.error("[MQTT] Erro geral:", err);
  }
};