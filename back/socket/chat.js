import { createMensagem } from '../models/MensagemModel.js';

const configureChat = (io) => {
 
  const onlineUsers = new Map();

  io.on('connection', (socket) => {


    socket.on('join', (userId) => {
      if (userId) {
 
        onlineUsers.set(userId.toString(), socket.id);

        socket.join(userId.toString());
      }
    });

    socket.on('private_message', async (data) => {
      const { remetenteId, destinatarioId, conteudo } = data;

      try {
        const novaMensagem = await createMensagem({
          remetente_id: remetenteId,
          destinatario_id: destinatarioId,
          conteudo: conteudo,
        });

        const destinatarioSocketId = onlineUsers.get(destinatarioId.toString());
        if (destinatarioSocketId) {
            io.to(destinatarioSocketId).emit('new_message', novaMensagem);
        }

        socket.emit('new_message', novaMensagem);

      } catch (error) {
        console.error('Erro ao salvar e emitir mensagem:', error);
      }
    });

    socket.on('disconnect', () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
 
    });
  });
};

export default configureChat;