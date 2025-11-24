// =================================================================================
// Arquivo: mobile/src/screens/ProfileScreen.js
// =================================================================================

import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator, Modal, SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../context/NotificationContext';
import API_URL from '../config/api';

// --- Funções de Formatação ---
const formatCPF = (text) => {
  if (!text) return '';
  return String(text).replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatCEP = (text) => {
  if (!text) return '';
  return String(text).replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
};

export default function ProfileScreen({ navigation }) {
  const { user, updateUserLocal, logout } = useNotification();

  // DEBUG: Veja no seu terminal o que está chegando aqui!
  useEffect(() => {
    console.log("Dados do Usuário na Tela de Perfil:", user);
  }, [user]);

  // Controle do Modal de Edição
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  
  // Controle dos Modais de Seleção (Sexo e Estado Civil)
  const [selectorType, setSelectorType] = useState(null); // 'sexo' ou 'civil'

  // Estados do Formulário de Edição
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCep, setEditCep] = useState('');
  const [editSexo, setEditSexo] = useState('');
  const [editEstadoCivil, setEditEstadoCivil] = useState('');
  const [editSenha, setEditSenha] = useState('');
  const [editConfirmarSenha, setEditConfirmarSenha] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Carrega os dados no formulário quando abre o modal
  const openEditModal = () => {
    if (user) {
      // Preenche com os dados atuais OU deixa vazio se não tiver
      setEditNome(user.nome || '');
      setEditEmail(user.email || '');
      setEditCep(formatCEP(user.CEP || ''));
      setEditSexo(user.sexo || '');
      setEditEstadoCivil(user.estadoCivil || '');
      
      // Senha sempre começa vazia
      setEditSenha('');
      setEditConfirmarSenha('');
    }
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    // REMOVIDO: A validação que obrigava preencher tudo.
    
    // Validação apenas de senha, SE o usuário tentar mudar
    if (editSenha && editSenha !== editConfirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);

    // Monta o objeto com os dados editados
    // Se o campo estiver vazio no state, enviamos vazio ou o que estava antes?
    // Aqui enviamos o que está no input. Se o usuário apagou, envia vazio.
    const body = {
      cpf: user.cpf, // Identificador (não alterável)
      nome: editNome,
      email: editEmail,
      CEP: editCep.replace(/\D/g, ''),
      sexo: editSexo,
      estadoCivil: editEstadoCivil,
    };

    // Só envia senha se foi preenchida
    if (editSenha) {
      body.senha = editSenha;
    }

    try {
      const response = await fetch(`${API_URL}/user/put`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensagem || "Erro ao atualizar perfil.");
      }

      // Atualiza o contexto localmente para refletir na hora
      await updateUserLocal({
        nome: editNome,
        email: editEmail,
        CEP: editCep.replace(/\D/g, ''),
        sexo: editSexo,
        estadoCivil: editEstadoCivil
      });

      Alert.alert("Sucesso", "Dados atualizados!");
      setEditModalVisible(false);

    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Sair", "Deseja realmente sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Sair", 
        style: "destructive", 
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      }
    ]);
  };

  // --- Componente de Linha de Informação (Visualização) ---
  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color="#28a745" />
      </View>
      <View style={{flex: 1}}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Não informado'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      <ScrollView contentContainerStyle={{paddingBottom: 40}}>
        
        {/* --- CABEÇALHO --- */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user?.nome ? user.nome.charAt(0).toUpperCase() : 'U'}</Text>
          </View>
          <Text style={styles.headerName}>{user?.nome || 'Usuário'}</Text>
          <View style={styles.badgeRole}>
            <Text style={styles.headerRole}>{user?.cargo || 'Sem cargo'}</Text>
          </View>
        </View>

        {/* --- LISTA DE INFORMAÇÕES (SOMENTE LEITURA) --- */}
        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>
          
          <InfoRow icon="person-outline" label="Nome Completo" value={user?.nome} />
          <InfoRow icon="card-outline" label="CPF" value={formatCPF(user?.cpf)} />
          <InfoRow icon="male-female-outline" label="Sexo" value={user?.sexo} />
          <InfoRow icon="heart-outline" label="Estado Civil" value={user?.estadoCivil} />
          
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Contato e Endereço</Text>

          <InfoRow icon="mail-outline" label="E-mail" value={user?.email} />
          <InfoRow icon="location-outline" label="CEP" value={formatCEP(user?.CEP)} />
          <InfoRow icon="briefcase-outline" label="Cargo" value={user?.cargo} />

          {/* BOTÃO EDITAR */}
          <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
            <Ionicons name="create-outline" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.editButtonText}>Editar Perfil</Text>
          </TouchableOpacity>

          {/* BOTÃO SAIR */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* --- MODAL DE EDIÇÃO --- */}
      <Modal 
        visible={isEditModalVisible} 
        animationType="slide" 
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            
            {/* CPF (Bloqueado) */}
            <Text style={styles.label}>CPF (Não alterável)</Text>
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledText}>{formatCPF(user?.cpf)}</Text>
              <Ionicons name="lock-closed" size={16} color="#999" />
            </View>

            {/* Cargo (Bloqueado) */}
            <Text style={styles.label}>Cargo (Não alterável)</Text>
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledText}>{user?.cargo}</Text>
              <Ionicons name="lock-closed" size={16} color="#999" />
            </View>

            <View style={styles.divider} />

            {/* Campos Editáveis - JÁ PREENCHIDOS PELO openEditModal */}
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput 
                style={styles.input} 
                value={editNome} 
                onChangeText={setEditNome} 
                placeholder="Digite seu nome"
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput 
                style={styles.input} 
                value={editEmail} 
                onChangeText={setEditEmail} 
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <Text style={styles.label}>CEP</Text>
            <TextInput 
                style={styles.input} 
                value={editCep} 
                onChangeText={(t) => setEditCep(formatCEP(t))} 
                keyboardType="numeric" 
                maxLength={9} 
            />

            {/* Seletores */}
            <View style={{flexDirection: 'row', gap: 10}}>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Sexo</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setSelectorType('sexo')}>
                  <Text style={styles.selectorText}>{editSexo || 'Selecione'}</Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Estado Civil</Text>
                <TouchableOpacity style={styles.selector} onPress={() => setSelectorType('civil')}>
                  <Text style={styles.selectorText}>{editEstadoCivil || 'Selecione'}</Text>
                  <Ionicons name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Alterar Senha (Opcional)</Text>

            <Text style={styles.label}>Nova Senha</Text>
            <TextInput style={styles.input} value={editSenha} onChangeText={setEditSenha} secureTextEntry placeholder="Deixe vazio para não alterar" />

            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput style={styles.input} value={editConfirmarSenha} onChangeText={setEditConfirmarSenha} secureTextEntry placeholder="Repita a senha se for alterar" />

            <View style={{height: 20}} />

            {loading ? (
              <ActivityIndicator size="large" color="#28a745" />
            ) : (
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            )}
            <View style={{height: 40}} />
          </ScrollView>

          {/* Modal Interno para Seleção (Sexo / Estado Civil) */}
          {selectorType && (
            <View style={styles.selectorOverlay}>
              <View style={styles.selectorModal}>
                <Text style={styles.selectorTitle}>
                  Selecione {selectorType === 'sexo' ? 'o Sexo' : 'o Estado Civil'}
                </Text>
                
                {(selectorType === 'sexo' 
                  ? ['Masculino', 'Feminino', 'Outro'] 
                  : ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viuvo(a)']
                ).map((opt) => (
                  <TouchableOpacity 
                    key={opt} 
                    style={styles.selectorOption} 
                    onPress={() => {
                      if (selectorType === 'sexo') setEditSexo(opt);
                      else setEditEstadoCivil(opt);
                      setSelectorType(null);
                    }}
                  >
                    <Text style={styles.selectorOptionText}>{opt}</Text>
                    {((selectorType === 'sexo' && editSexo === opt) || (selectorType === 'civil' && editEstadoCivil === opt)) && (
                      <Ionicons name="checkmark" size={20} color="#28a745" />
                    )}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.cancelSelector} onPress={() => setSelectorType(null)}>
                  <Text style={{color: 'red'}}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- Header e Visualização ---
  header: { backgroundColor: '#28a745', alignItems: 'center', paddingVertical: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 15 },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 5 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#28a745' },
  headerName: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  badgeRole: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 5 },
  headerRole: { fontSize: 14, color: '#fff', textTransform: 'uppercase', fontWeight: 'bold' },

  cardContainer: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 15, padding: 20, elevation: 2, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.1, shadowRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
  infoValue: { fontSize: 16, color: '#333', fontWeight: '500' },

  editButton: { backgroundColor: '#28a745', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 10, marginTop: 10 },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  logoutButton: { marginTop: 15, alignItems: 'center', paddingVertical: 10 },
  logoutButtonText: { color: '#dc3545', fontSize: 16, fontWeight: '500' },

  // --- Modal de Edição ---
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  modalContent: { padding: 20 },
  
  label: { fontSize: 14, color: '#666', marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#f9f9f9', borderRadius: 8, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#ddd', fontSize: 16, color: '#333', marginBottom: 15 },
  
  // Estilos para campos bloqueados
  disabledInput: { backgroundColor: '#e9ecef', borderColor: '#ced4da', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  disabledText: { color: '#6c757d', fontSize: 16 },

  selector: { backgroundColor: '#f9f9f9', borderRadius: 8, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#ddd', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  selectorText: { fontSize: 16, color: '#333' },

  saveButton: { backgroundColor: '#28a745', height: 55, borderRadius: 10, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  // --- Overlay de Seleção (Sexo/Civil) ---
  selectorOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  selectorModal: { width: '80%', backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 10 },
  selectorTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  selectorOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between' },
  selectorOptionText: { fontSize: 16, color: '#333' },
  cancelSelector: { marginTop: 15, alignItems: 'center', padding: 10 },
});