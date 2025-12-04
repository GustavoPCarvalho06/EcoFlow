import { updateLixo } from "../models/lixeiraModels.js";
import { registrarLog } from "../models/LogModel.js";
import { read } from "../config/database.js"; 

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

      let localizacaoTexto = "Local desconhecido";
      try {

        const sql = "SELECT endereco FROM SistemaSensor WHERE id_Sensor = ?"; 
        const resultado = await read(sql, [id]);
        if (resultado && resultado.length > 0) {
          localizacaoTexto = resultado[0].endereco;
        }
      } catch (err) {
        console.error("Erro ao buscar endereço do sensor:", err);
      }

      await registrarLog({
        usuario_id: null,
        nome_usuario: "Sensor IoT", 
        cargo_usuario: "IoT",      
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