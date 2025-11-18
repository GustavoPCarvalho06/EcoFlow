// =================================================================================
// Arquivo: C:\...\EcoFlow\mobliler\src\screens\LoginScreen.js (VERSÃO FINAL COM REDIRECIONAMENTO PARA DRAWER)
// =================================================================================

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, Modal } from 'react-native';

// !! IMPORTANTE !! Substitua pelo IP do seu backend.
const API_URL = 'http://10.84.6.136:3001';

// Função para formatar o CPF enquanto o usuário digita
const formatCPF = (value) => {
  const cleanValue = value.replace(/\D/g, ''); 
  const limitedValue = cleanValue.slice(0, 11); 

  if (limitedValue.length > 9) {
    return limitedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (limitedValue.length > 6) {
    return limitedValue.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (limitedValue.length > 3) {
    return limitedValue.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }
  return limitedValue;
};


// --- Componente do Modal de Recuperação de Senha ---
const ForgotPasswordModal = ({ visible, onClose }) => {
    const [step, setStep] = useState(1);
    const [cpf, setCpf] = useState('');
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const resetModal = () => { setStep(1); setCpf(''); setCodigo(''); setNovaSenha(''); setConfirmarSenha(''); setError(''); setSuccess(''); setIsLoading(false); onClose(); };
    const handleSendCode = async () => { setIsLoading(true); setError(''); try { const response = await fetch(`${API_URL}/recuperacao/enviar-codigo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cpf: cpf.replace(/\D/g, '') }), }); const data = await response.json(); if (!response.ok) throw new Error(data.mensagem); setSuccess('Código enviado para seu e-mail!'); setStep(2); } catch (err) { setError(err.message); } finally { setIsLoading(false); } };
    const handleVerifyCode = async () => { setIsLoading(true); setError(''); try { const response = await fetch(`${API_URL}/recuperacao/verificar-codigo`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cpf: cpf.replace(/\D/g, ''), codigo }), }); const data = await response.json(); if (!response.ok) throw new Error(data.mensagem); setSuccess('Código verificado com sucesso!'); setStep(3); } catch (err) { setError(err.message); } finally { setIsLoading(false); } };
    const handleResetPassword = async () => { if (novaSenha !== confirmarSenha) { setError('As senhas não coincidem.'); return; } setIsLoading(true); setError(''); try { const response = await fetch(`${API_URL}/recuperacao/redefinir-senha`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cpf: cpf.replace(/\D/g, ''), codigo, novaSenha }), }); const data = await response.json(); if (!response.ok) throw new Error(data.mensagem); setSuccess('Senha redefinida com sucesso!'); setTimeout(resetModal, 2000); } catch (err) { setError(err.message); } finally { setIsLoading(false); } };

    return ( <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={resetModal}> <View style={styles.modalContainer}> <View style={styles.modalView}> <Text style={styles.modalTitle}>Recuperar Senha</Text> {error && <Text style={styles.errorTextModal}>{error}</Text>} {success && <Text style={styles.successText}>{success}</Text>} {step === 1 && ( <> <Text style={styles.modalDescription}>Digite seu CPF para iniciarmos a recuperação.</Text> <TextInput style={styles.input} placeholder="CPF" value={cpf} onChangeText={(text) => setCpf(formatCPF(text))} keyboardType="numeric" /> <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={isLoading}> <Text style={styles.buttonText}>{isLoading ? 'Enviando...' : 'Enviar Código'}</Text> </TouchableOpacity> </> )} {step === 2 && ( <> <Text style={styles.modalDescription}>Insira o código de 6 dígitos enviado para seu e-mail.</Text> <TextInput style={styles.input} placeholder="Código" value={codigo} onChangeText={setCodigo} keyboardType="numeric" maxLength={6} /> <TouchableOpacity style={styles.button} onPress={handleVerifyCode} disabled={isLoading}> <Text style={styles.buttonText}>{isLoading ? 'Verificando...' : 'Verificar Código'}</Text> </TouchableOpacity> </> )} {step === 3 && ( <> <Text style={styles.modalDescription}>Crie uma nova senha.</Text> <TextInput style={styles.input} placeholder="Nova Senha" value={novaSenha} onChangeText={setNovaSenha} secureTextEntry /> <TextInput style={styles.input} placeholder="Confirmar Nova Senha" value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry /> <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={isLoading}> <Text style={styles.buttonText}>{isLoading ? 'Salvando...' : 'Redefinir Senha'}</Text> </TouchableOpacity> </> )} <TouchableOpacity style={styles.closeButton} onPress={resetModal}> <Text style={styles.closeButtonText}>Fechar</Text> </TouchableOpacity> </View> </View> </Modal> );
};


// --- Componente Principal da Tela de Login ---
export default function LoginScreen({ navigation }) {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [senhaError, setSenhaError] = useState('');

  const handleLogin = async () => {
    if (!cpf || !senha) {
      Alert.alert("Erro", "Por favor, preencha o CPF e a senha.");
      return;
    }

    setIsLoading(true);
    setCpfError('');
    setSenhaError('');
    const rawCpf = cpf.replace(/\D/g, "");

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: rawCpf, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.erro === 'Senha inválida.') {
          setSenhaError(data.erro);
        } else {
          setCpfError(data.erro);
        }
        return;
      }

      if (data.user && data.user.cargo === 'coletor') {
        // AQUI ESTÁ A MUDANÇA PRINCIPAL
        navigation.replace('AppDrawer', { user: data.user });
      } else {
        setCpfError("Acesso negado. App exclusivo para coletores.");
      }

    } catch (error) {
      setCpfError("Não foi possível conectar ao servidor. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>EcoFlow Coletor</Text>

      {cpfError ? <Text style={styles.errorText}>{cpfError}</Text> : null}
      
      <TextInput
        style={[styles.input, cpfError ? styles.inputError : null]}
        placeholder="CPF"
        keyboardType="numeric"
        value={cpf}
        onChangeText={(text) => setCpf(formatCPF(text))}
      />

      <TextInput
        style={[styles.input, senhaError ? styles.inputError : null]}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}

      <TouchableOpacity onPress={() => setIsModalVisible(true)}>
        <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator size="large" color="#28a745" style={{ marginTop: 20 }}/>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      )}

      <ForgotPasswordModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5', },
  logo: { width: 120, height: 120, marginBottom: 20, },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 30, },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 15, fontSize: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 15, },
  button: { width: '100%', height: 50, backgroundColor: '#28a745', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10, },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', },
  forgotPasswordText: { color: '#007bff', fontSize: 14, textAlign: 'right', width: '100%', marginBottom: 20, marginTop: -10 },
  errorText: { color: 'red', fontSize: 14, marginBottom: 10, textAlign: 'center', },
  inputError: { borderColor: 'red', borderWidth: 1, },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
  modalView: { width: '90%', backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, },
  modalDescription: { marginBottom: 15, textAlign: 'center', color: '#666' },
  errorTextModal: { color: 'red', marginBottom: 10, textAlign: 'center', },
  successText: { color: 'green', marginBottom: 10, textAlign: 'center', },
  closeButton: { marginTop: 15, backgroundColor: '#f0f0f0', borderRadius: 8, padding: 10, elevation: 2, width: '100%', alignItems: 'center' },
  closeButtonText: { color: '#333', fontWeight: 'bold', }
});