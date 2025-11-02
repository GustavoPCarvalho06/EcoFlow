// socket/chat.js
import { createMensagem } from '../models/MensagemModel.js';

const configureChat = (io) => {
  // Rastreia os usuários conectados
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`✅ Cliente conectado: ${socket.id}`);

    // Evento para o cliente se identificar após a conexão
    socket.on('join', (userId) => {
      if (userId) {
        console.log(`Usuário ID: ${userId} se juntou com o socket ID: ${socket.id}`);
        // Associa o ID do usuário ao ID do socket
        onlineUsers.set(userId.toString(), socket.id);
        // Coloca o socket em uma sala com seu próprio ID de usuário
        socket.join(userId.toString());
      }
    });

    // Ouve por mensagens privadas
    socket.on('private_message', async (data) => {
      const { remetenteId, destinatarioId, conteudo } = data;

      try {
        const novaMensagem = await createMensagem({
          remetente_id: remetenteId,
          destinatario_id: destinatarioId,
          conteudo: conteudo,
        });

        // Envia a mensagem para a sala do destinatário
        const destinatarioSocketId = onlineUsers.get(destinatarioId.toString());
        if (destinatarioSocketId) {
            io.to(destinatarioSocketId).emit('new_message', novaMensagem);
        }

        // Envia a mensagem de volta para o remetente
        socket.emit('new_message', novaMensagem);

      } catch (error) {
        console.error('Erro ao salvar e emitir mensagem:', error);
      }
    });

    socket.on('disconnect', () => {
      // Remove o usuário do rastreamento quando desconectar
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log(`❌ Cliente desconectado: ${socket.id}`);
    });
  });
};

export default configureChat;