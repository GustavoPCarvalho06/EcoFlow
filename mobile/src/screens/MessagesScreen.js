import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../context/NotificationContext';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'http://10.84.6.136:3001';

export default function MessagesScreen({ navigation }) {
  const { user, fetchCounts } = useNotification();
  
  const [users, setUsers] = useState([]);
  const [unreadPerUser, setUnreadPerUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Atualiza a lista sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
        if (user) fetchData();
    }, [user])
  );

  const fetchData = async () => {
    try {
      // 1. Pega todos os usuários (coordenadores/admins)
      const resUsers = await fetch(`${API_URL}/user/paginated?statusConta=ativo&limit=1000`);
      const dataUsers = await resUsers.json();
      
      // Filtra para não mostrar a mim mesmo
      const others = dataUsers.users.filter(u => u.id !== user.id);
      setUsers(others);

      // 2. Pega contagem de não lidas
      const resCounts = await fetch(`${API_URL}/msg/unread-counts`, {
        headers: { 'x-user-id': user.id.toString() }
      });
      const dataCounts = await resCounts.json();
      setUnreadPerUser(dataCounts);
      
      // Atualiza o badge global
      fetchCounts();

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.cargo.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const count = unreadPerUser[item.id] || 0;

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
                <Text style={styles.role}>{item.cargo}</Text>
            </View>
            <Text style={styles.preview}>Toque para conversar</Text>
        </View>

        {count > 0 && (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>
                    {count > 99 ? '+99' : count}
                </Text>
            </View>
        )}
        
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: 10 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  role: { fontSize: 12, color: '#888', textTransform: 'capitalize' },
  preview: { fontSize: 14, color: '#888', marginTop: 2 },
  badge: {
      backgroundColor: '#28a745',
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 6,
      marginRight: 10
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});