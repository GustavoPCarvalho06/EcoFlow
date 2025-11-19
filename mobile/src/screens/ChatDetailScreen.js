import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../context/NotificationContext';

const API_URL = 'http://10.84.6.136:3001';

export default function ChatDetailScreen({ route, navigation }) {
  const { recipient } = route.params; // Usuário com quem estamos falando
  const { user, socket, fetchCounts } = useNotification();
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  // 1. Configura Header e marca como lida ao entrar
  useEffect(() => {
    navigation.setOptions({ title: recipient.nome });
    markAsRead();
  }, []);

  // 2. Busca histórico e configura socket para ESSA conversa
  useEffect(() => {
    if(!user) return;

    fetchHistory();

    const handleNewMessage = (msg) => {
      // Se a mensagem for dessa conversa (enviada por mim ou pelo outro)
      const isFromRecipient = msg.remetente_id === recipient.id;
      const isFromMe = msg.remetente_id === user.id;

      if (isFromRecipient || (isFromMe && msg.destinatario_id === recipient.id)) {
        setMessages(prev => [...prev, msg]);
        
        // Se recebi mensagem com a tela aberta, marca como lida na hora
        if (isFromRecipient) {
             markAsRead();
        }
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      // Atualiza o badge global ao sair da tela
      fetchCounts(); 
    };
  }, [user]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/msg/historico/${recipient.id}`, {
        headers: { 'x-user-id': user.id.toString() }
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Erro histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await fetch(`${API_URL}/msg/mark-as-read/${recipient.id}`, {
        method: 'PUT',
        headers: { 'x-user-id': user.id.toString() }
      });
      fetchCounts(); // Atualiza contexto global
    } catch (error) {
      console.error("Erro marcar lido:", error);
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;

    const msgData = {
      remetenteId: user.id,
      destinatarioId: recipient.id,
      conteudo: text.trim()
    };

    // Emite via socket
    socket.emit('private_message', msgData);
    
    // Limpa input (a mensagem volta pelo socket e entra na lista)
    setText('');
  };

  const renderItem = ({ item }) => {
    const isMe = item.remetente_id === user.id;
    return (
      <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
        <Text style={[styles.msgText, isMe ? styles.textRight : styles.textLeft]}>
            {item.conteudo}
        </Text>
        <Text style={[styles.timeText, isMe ? styles.textTimeRight : null]}>
             {new Date(item.data_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#28a745" style={{marginTop: 20}} />
      ) : (
        <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            value={text}
            onChangeText={setText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e5ddd5' },
  listContent: { padding: 10, paddingBottom: 20 },
  bubble: {
      maxWidth: '80%',
      padding: 10,
      borderRadius: 10,
      marginBottom: 10,
  },
  bubbleLeft: {
      alignSelf: 'flex-start',
      backgroundColor: '#fff',
      borderTopLeftRadius: 0,
  },
  bubbleRight: {
      alignSelf: 'flex-end',
      backgroundColor: '#dcf8c6',
      borderTopRightRadius: 0,
  },
  msgText: { fontSize: 16, color: '#303030' },
  textLeft: { color: '#000' },
  textRight: { color: '#000' },
  timeText: { fontSize: 10, color: '#999', alignSelf: 'flex-end', marginTop: 4 },
  textTimeRight: { color: '#7fa672' },

  inputContainer: {
      flexDirection: 'row',
      padding: 10,
      backgroundColor: '#f0f0f0',
      alignItems: 'center'
  },
  input: {
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 8,
      fontSize: 16,
      marginRight: 10,
      maxHeight: 100
  },
  sendBtn: {
      backgroundColor: '#28a745',
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center'
  }
});