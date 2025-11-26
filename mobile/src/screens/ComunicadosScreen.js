// =================================================================================
// Arquivo: mobile/src/screens/ComunicadosScreen.js
// =================================================================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';

// Importa o contexto para atualizar o número na aba lá embaixo
import { useNotification } from '../context/NotificationContext';

import API_URL from '../config/api'; 

export default function ComunicadosScreen() {
  // Pegamos o usuário e a função de atualizar o badge (fetchCounts) do contexto
  const { user, fetchCounts } = useNotification();

  const [comunicados, setComunicados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Sets para controlar visualmente quem é azul e quem é laranja
  const [unseenIds, setUnseenIds] = useState(new Set());
  const [editedUnseenIds, setEditedUnseenIds] = useState(new Set());

  // Função principal que busca os dados
  const fetchData = async () => {
    // 1. Verificação de segurança: precisa do token
    if (!user || !user.token) return;

    try {
      // 2. Cria os Headers com o Token
      const headers = { 
        'Content-Type': 'application/json',
        'x-user-id': user.id.toString(),
        'Authorization': `Bearer ${user.token}` // <--- ADICIONADO
      };

      // Busca a lista de comunicados E os IDs detalhados (quem é novo, quem é editado)
      const [comunicadosRes, unseenRes] = await Promise.all([
        // 3. Passa os headers na requisição da lista
        fetch(`${API_URL}/comunicados`, { headers }),
        // 4. Passa os headers na requisição dos não vistos
        fetch(`${API_URL}/comunicados/unseen-ids-detailed`, { headers })
      ]);

      const comunicadosData = await comunicadosRes.json();
      const unseenData = await unseenRes.json();

      setComunicados(comunicadosData);
      
      // Salva nos Sets para verificar rápido na hora de renderizar
      setUnseenIds(new Set(unseenData.new_ids));
      setEditedUnseenIds(new Set(unseenData.edited_ids));

      // Garante que a bolinha vermelha da aba esteja sincronizada
      fetchCounts();

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Monitora o usuário e o Socket
  useEffect(() => {
    if (user) {
      fetchData();

      const socket = io(API_URL);
      socket.on('comunicados_atualizados', () => {
        console.log("Socket: Novos dados recebidos no Mural");
        fetchData();
      });

      return () => socket.disconnect();
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Ao clicar no card
  const handlePress = async (id) => {
    // Abre ou fecha o card (Sanfona)
    setExpandedId(expandedId === id ? null : id);

    const isUnseen = unseenIds.has(id);
    const isEdited = editedUnseenIds.has(id);

    // Se for um comunicado não lido (Novo ou Editado)
    if ((isUnseen || isEdited) && user && user.token) {
        
        // 1. Atualiza a interface LOCALMENTE na hora (remove o badge azul/laranja)
        if (isUnseen) {
            const newSet = new Set(unseenIds);
            newSet.delete(id);
            setUnseenIds(newSet);
        }
        if (isEdited) {
            const newSet = new Set(editedUnseenIds);
            newSet.delete(id);
            setEditedUnseenIds(newSet);
        }

        // 2. Avisa o backend que foi lido
        try {
            await fetch(`${API_URL}/comunicados/mark-one-seen/${id}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-user-id': user.id.toString(),
                    'Authorization': `Bearer ${user.token}` // <--- ADICIONADO
                }
            });
            
            // 3. Atualiza a bolinha vermelha na aba de navegação
            fetchCounts(); 

        } catch (error) {
            console.error("Erro ao marcar visto:", error);
        }
    }
  };

  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const date = new Date(item.data_publicacao).toLocaleDateString('pt-BR');
    
    // Verifica se deve mostrar etiqueta
    const isNew = unseenIds.has(item.id);
    const isEditedAndUnseen = editedUnseenIds.has(item.id);

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handlePress(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
                <View style={styles.titleBadgeRow}>
                    {/* Etiqueta Azul (Novo) */}
                    {isNew && (
                        <View style={[styles.badge, styles.bgBlue]}>
                            <Text style={styles.badgeText}>Novo</Text>
                        </View>
                    )}
                    
                    {/* Etiqueta Laranja (Editado) - Só aparece se não for Novo */}
                    {!isNew && isEditedAndUnseen && (
                        <View style={[styles.badge, styles.bgOrange]}>
                            <Text style={styles.badgeText}>Editado</Text>
                        </View>
                    )}

                    <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                        {item.titulo}
                    </Text>
                </View>

                <Text style={styles.cardMeta}>
                    {date} • {item.autor_nome}
                </Text>
            </View>

            <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#999" 
            />
        </View>

        {/* Conteúdo Expandido */}
        {isExpanded && (
          <View style={styles.contentContainer}>
            <Text style={styles.cardContent}>{item.conteudo}</Text>
            {item.data_edicao && (
                 <Text style={styles.editedText}>
                     (Editado em {new Date(item.data_edicao).toLocaleDateString('pt-BR')})
                 </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={comunicados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum comunicado no mural.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 15 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  titleContainer: {
      flex: 1,
      marginRight: 10,
  },
  titleBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      flexWrap: 'wrap'
  },
  cardTitle: { 
      fontSize: 16, 
      fontWeight: 'bold', 
      color: '#333',
      flexShrink: 1 
  },
  cardMeta: { fontSize: 12, color: '#888' },
  
  badge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginRight: 6,
  },
  bgBlue: { backgroundColor: '#3b82f6' },
  bgOrange: { backgroundColor: '#f97316' },
  badgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase'
  },

  contentContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0'
  },
  cardContent: { 
      fontSize: 14, 
      color: '#444', 
      lineHeight: 22 
  },
  editedText: {
      fontSize: 11,
      color: '#aaa',
      fontStyle: 'italic',
      marginTop: 8,
      textAlign: 'right'
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' }
});