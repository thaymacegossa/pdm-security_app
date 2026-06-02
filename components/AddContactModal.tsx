import { saveActiveContacts, updateActiveContacts } from '@/src/services/firebase/activeContacts.service';
import { devLog } from '@/src/utils/dev-log';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type AddContactModalProps = {
  visible: boolean;
  userId: string;
  onClose: () => void;
  onContactAdded: () => void;
  editingContact?: { id?: string; name: string; phone: string; relation: string } | null;
};

export default function AddContactModal({
  visible,
  userId,
  onClose,
  onContactAdded,
  editingContact = null,
}: AddContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (editingContact) {
      setName(editingContact.name || '');
      setPhone(editingContact.phone || '');
      setRelation(editingContact.relation || '');
    } else {
      setName('');
      setPhone('');
      setRelation('');
    }
  }, [editingContact, visible]);

  const handleAddContact = async () => {
    // Validações
    if (!name.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, insira o nome do contato');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, insira o telefone');
      return;
    }

    if (!relation.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, insira a relação');
      return;
    }

    // Validar formato do telefone (básico)
    const phoneRegex = /^[\d\s()+-]+$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert('Telefone inválido', 'Por favor, insira um telefone válido');
      return;
    }

    try {
      setIsLoading(true);
      if (editingContact && editingContact.id) {
        await updateActiveContacts(userId, editingContact.id, {
          name: name.trim(),
          phone: phone.trim(),
          relation: relation.trim(),
          isActive: true,
        });
      } else {
        await saveActiveContacts(userId, {
          name: name.trim(),
          phone: phone.trim(),
          relation: relation.trim(),
          isActive: true,
        });
      }

      // Fechar modal e atualizar
      onClose();
      onContactAdded();

      Alert.alert('Sucesso', editingContact && editingContact.id ? 'Contato atualizado com sucesso!' : 'Contato adicionado com sucesso!');
    } catch (error) {
      devLog('[AddContactModal] erro ao adicionar contato', error);
      Alert.alert('Erro', 'Não foi possível adicionar o contato. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Limpar formulário
    setName('');
    setPhone('');
    setRelation('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Adicionar Contato de Emergência</Text>

          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Telefone"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Relação (ex: Mãe, Pai, Amigo)"
            placeholderTextColor="#999"
            value={relation}
            onChangeText={setRelation}
            editable={!isLoading}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.addButton, isLoading && styles.addButtonDisabled]}
              onPress={handleAddContact}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.addButtonText}>Adicionar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
