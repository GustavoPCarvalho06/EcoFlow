// =================================================================================
// Arquivo: mobile/src/screens/ChatDetailScreen.js
// =================================================================================

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../context/NotificationContext';
import API_URL from '../config/api'; 

export default function ChatDetailScreen({ route, navigation }) {
  const { recipient } = route.params; 
  const { user, socket, fetchCounts } = useNotification();
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: recipient.nome });
    markAsRead();
  }, []);

  useEffect(() => {
    if(!user) return;

    fetchHistory();

    const handleNewMessage = (msg) => {
      const isFromRecipient = msg.remetente_id === recipient.id;
      const isFromMe = msg.remetente_id === user.id;

      if (isFromRecipient || (isFromMe && msg.destinatario_id === recipient.id)) {
        setMessages(prev => {
            // Evita duplicação se a mensagem já estiver na lista (ex: adicionada localmente)
            const exists = prev.some(m => m.id === msg.id || (m.conteudo === msg.conteudo && m.remetente_id === msg.remetente_id));
            if (exists) return prev;
            return [...prev, msg];
        });
        
        if (isFromRecipient) {
             markAsRead();
        }
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      fetchCounts(); 
    };
  }, [user]);

  // 1. BUSCAR HISTÓRICO COM TOKEN
  const fetchHistory = async () => {
    if (!user || !user.token) return;
    try {
      const response = await fetch(`${API_URL}/msg/historico/${recipient.id}`, {
        headers: { 
            'Content-Type': 'application/json',
            'x-user-id': user.id.toString(),
            'Authorization': `Bearer ${user.token}` // <--- ADICIONADO
        }
      });
      if(response.ok){
          const data = await response.json();
          setMessages(data);
      } else {
          console.log("Erro fetch history status:", response.status);
      }
    } catch (error) {
      console.error("Erro histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. MARCAR COMO LIDA COM TOKEN
  const markAsRead = async () => {
    if (!user || !user.token) return;
    try {
      await fetch(`${API_URL}/msg/mark-as-read/${recipient.id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'x-user-id': user.id.toString(),
            'Authorization': `Bearer ${user.token}` // <--- ADICIONADO
        }
      });
      fetchCounts(); 
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

    // Cria msg local para feedback instantâneo
    const localMsg = {
        id: Math.random().toString(),
        remetente_id: user.id,
        destinatario_id: recipient.id,
        conteudo: text.trim(),
        data_envio: new Date().toISOString(),
        remetente_nome: user.nome
    };

    setMessages(prev => [...prev, localMsg]);
    socket.emit('private_message', msgData);
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
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
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
  bubble: { maxWidth: '80%', padding: 10, borderRadius: 10, marginBottom: 10 },
  bubbleLeft: { alignSelf: 'flex-start', backgroundColor: '#fff', borderTopLeftRadius: 0 },
  bubbleRight: { alignSelf: 'flex-end', backgroundColor: '#dcf8c6', borderTopRightRadius: 0 },
  msgText: { fontSize: 16, color: '#303030' },
  textLeft: { color: '#000' },
  textRight: { color: '#000' },
  timeText: { fontSize: 10, color: '#999', alignSelf: 'flex-end', marginTop: 4 },
  textTimeRight: { color: '#7fa672' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#f0f0f0', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, fontSize: 16, marginRight: 10, maxHeight: 100 },
  sendBtn: { backgroundColor: '#28a745', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});