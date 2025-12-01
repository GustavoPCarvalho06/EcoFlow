import { updateLixo } from "../models/lixeiraModels.js"; // Importamos seu model existente
import { registrarLog } from "../models/LogModel.js"; // Importamos logs

export const handleMqttMessage = async (topic, payload, io) => {
  try {
    // 1. Converte a mensagem (Buffer) para String e depois para JSON
    const mensagemString = payload.toString();
    console.log(`[MQTT] Mensagem recebida no tópico "${topic}":`, mensagemString);

    // O Arduino deve enviar um JSON, ex: { "id": 1, "status": "Cheia" }
    let dados;
    try {
      dados = JSON.parse(mensagemString);
    } catch (e) {
      console.error("[MQTT] Erro: A mensagem não é um JSON válido.");
      return;
    }

    // 2. Verifica o tópico para saber o que fazer
    // Vamos supor que o Arduino publica em: "ecoflow/sensor/atualizar"
    if (topic === "ecoflow/sensor/atualizar") {
      
      const { id, status } = dados;

      if (!id || !status) {
        console.error("[MQTT] Dados incompletos (precisa de id e status).");
        return;
      }

      // 3. Atualiza no Banco de Dados (Reutilizando sua função existente)
      await updateLixo({ statusLixo: status }, id);
      console.log(`[MQTT] Lixeira ${id} atualizada para ${status} no Banco.`);

      // 4. Cria um Log do Sistema (Opcional, mas bom para rastreio)
      await registrarLog({
        usuario_id: null, // É o sistema/arduino, não um usuário logado
        nome_usuario: "Sistema Arduino",
        cargo_usuario: "IoT",
        acao: "ATUALIZACAO_SENSOR",
        detalhes: `Sensor ${id} atualizou status para: ${status}`,
        ip: "MQTT"
      });

      // 5. Avisa o Frontend em Tempo Real (Socket.IO)
      // O frontend vai ouvir esse evento e atualizar o mapa/lista sem F5
      io.emit("sensor_atualizado", { id, status });
    }

  } catch (err) {
    console.error("[MQTT] Erro ao processar mensagem:", err);
  }
};