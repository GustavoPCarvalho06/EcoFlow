// socket/chat.js

// Vamos precisar de uma função do model para salvar as mensagens
import { createMensagem } from '../models/MensagemModel.js'; 

// Mapeamento para saber qual socket pertence a qual usuário
// Em produção, para múltiplos servidores, seria melhor usar algo como Redis
const userSockets = new Map(); // Chave: userId, Valor: socket.id

const configureChat = (io) => {
  // Este evento é disparado toda vez que um novo cliente (navegador) se conecta
  io.on('connection', (socket) => {
    console.log(`Novo cliente conectado: ${socket.id}`);

    // 1. Evento para o usuário se "identificar" ao se conectar
    // O front-end deve emitir este evento logo após a conexão, enviando o ID do usuário logado
    socket.on('join', (userId) => {
      console.log(`Usuário ${userId} entrou no chat com o socket ${socket.id}`);
      userSockets.set(userId, socket.id);
      socket.userId = userId; // Armazenamos o ID do usuário no próprio socket para fácil acesso
    });

    // 2. Evento para receber e encaminhar uma mensagem privada
    socket.on('private_message', async ({ destinatarioId, conteudo }) => {
      const remetenteId = socket.userId;

      if (!remetenteId || !destinatarioId || !conteudo) {
        // Enviar um erro de volta para o remetente
        socket.emit('chat_error', { message: 'Dados da mensagem incompletos.' });
        return;
      }
      
      try {
        // a. Salva a mensagem no banco de dados
        const novaMensagem = await createMensagem({ remetente_id: remetenteId, destinatario_id: destinatarioId, conteudo });

        // b. Procura o socket do destinatário para ver se ele está online
        const destinatarioSocketId = userSockets.get(parseInt(destinatarioId));
        
        console.log(`Mensagem de ${remetenteId} para ${destinatarioId}. Destinatário está online? ${!!destinatarioSocketId}`);

        if (destinatarioSocketId) {
          // c. Se o destinatário estiver online, envia a mensagem em tempo real para ele
          io.to(destinatarioSocketId).emit('new_message', novaMensagem);
        }
        
        // d. Envia uma confirmação de volta para o remetente (para o UI dele atualizar)
        socket.emit('message_sent_confirmation', novaMensagem);

      } catch (error) {
        console.error('Erro ao processar mensagem privada:', error);
        socket.emit('chat_error', { message: 'Erro ao salvar ou enviar a mensagem.' });
      }
    });

    // 3. Evento quando o cliente se desconecta
    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
      if (socket.userId) {
        // Remove o usuário do nosso mapeamento quando ele se desconecta
        userSockets.delete(socket.userId);
      }
    });
  });
};

export default configureChat;