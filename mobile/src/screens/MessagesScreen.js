// =================================================================================
// Arquivo: mobile/src/screens/MessagesScreen.js
// =================================================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../context/NotificationContext';
import { useFocusEffect } from '@react-navigation/native';

import API_URL from '../config/api';

export default function MessagesScreen({ navigation }) {
  const { user, fetchCounts, socket } = useNotification();
  
  const [users, setUsers] = useState([]);
  const [unreadPerUser, setUnreadPerUser] = useState({});
  const [lastActivity, setLastActivity] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Atualiza dados ao focar na tela (voltar do chat)
  useFocusEffect(
    useCallback(() => {
        if (user) fetchData();
    }, [user])
  );

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessageList = (msg) => {
      // Se a mensagem for para mim
      if (msg.destinatario_id === user.id) {
        // Atualiza contador
        setUnreadPerUser((prev) => ({
          ...prev,
          [msg.remetente_id]: (prev[msg.remetente_id] || 0) + 1
        }));

        // Atualiza horário para ordenar
        setLastActivity((prev) => ({
            ...prev,
            [msg.remetente_id]: Date.now()
        }));

        fetchCounts();
      }
    };

    socket.on('new_message', handleNewMessageList);

    return () => {
      socket.off('new_message', handleNewMessageList);
    };
  }, [socket, user]);

  const fetchData = async () => {
    try {
      const resCounts = await fetch(`${API_URL}/msg/unread-counts`, {
        headers: { 'x-user-id': user.id.toString() }
      });
      const dataCounts = await resCounts.json();
      setUnreadPerUser(dataCounts);
      
      if (users.length === 0) {
        const resUsers = await fetch(`${API_URL}/user/paginated?statusConta=ativo&limit=1000`);
        const dataUsers = await resUsers.json();
        const others = dataUsers.users.filter(u => u.id !== user.id);
        setUsers(others);
      }
      
      fetchCounts();

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Ordenação: Mantém quem mandou mensagem por último no topo
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
        const timeA = lastActivity[a.id] || 0;
        const timeB = lastActivity[b.id] || 0;

        if (timeA !== timeB) return timeB - timeA;

        const unreadA = unreadPerUser[a.id] ? 1 : 0;
        const unreadB = unreadPerUser[b.id] ? 1 : 0;

        if (unreadA !== unreadB) return unreadB - unreadA;

        return a.nome.localeCompare(b.nome);
    });
  }, [users, lastActivity, unreadPerUser]);


  const filteredUsers = sortedUsers.filter(u => 
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.cargo.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const count = unreadPerUser[item.id] || 0;
    const hasRecentActivity = lastActivity[item.id];
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('ChatDetail', { recipient: item })}
      >
        <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
                {item.nome.charAt(0).toUpperCase()}
            </Text>
        </View>
        
        <View style={styles.infoContainer}>
            <View style={styles.row}>
                <Text style={styles.name}>{item.nome}</Text>
                
                {/* 
                   AQUI ESTÁ A MUDANÇA:
                   Só mostra o horário se tiver atividade recente E contador > 0.
                   Caso contrário, mostra o Cargo.
                */}
                {(hasRecentActivity && count > 0) ? (
                    <Text style={styles.timeText}>
                        {new Date(hasRecentActivity).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                ) : (
                    <Text style={styles.role}>{item.cargo}</Text>
                )}
            </View>

            <Text style={styles.preview} numberOfLines={1}>
                {count > 0 ? "Novas mensagens recebidas" : "Toque para conversar"}
            </Text>
        </View>

        {count > 0 && (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>
                    {count > 99 ? '+99' : count}
                </Text>
            </View>
        )}
        
        <Ionicons name="chevron-forward" size={20} color="#ccc" style={{marginLeft: 5}} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput 
            style={styles.searchInput}
            placeholder="Buscar contato..."
            value={search}
            onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#28a745" style={{marginTop: 20}} />
      ) : (
        <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>Nenhum contato encontrado</Text>}
            extraData={{unreadPerUser, lastActivity}} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchContainer: {
      flexDirection: 'row',
      backgroundColor: '#f1f1f1',
      margin: 10,
      borderRadius: 10,
      alignItems: 'center',
      paddingHorizontal: 10
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 45 },
  list: { paddingBottom: 20 },
  card: {
      flexDirection: 'row',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      alignItems: 'center'
  },
  avatarContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#e1e1e1',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#555' },
  infoContainer: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  role: { fontSize: 12, color: '#888', textTransform: 'capitalize' },
  timeText: { fontSize: 11, color: '#28a745', fontWeight: 'bold' },
  preview: { fontSize: 14, color: '#888', marginTop: 2 },
  badge: {
      backgroundColor: '#28a745',
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
      marginLeft: 5
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});