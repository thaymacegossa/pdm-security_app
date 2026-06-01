import { deleteActiveContacts, getActiveContacts, subscribeActiveContacts } from '@/src/services/firebase/activeContacts.service';
import { devLog } from '@/src/utils/dev-log';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddContactModal from './AddContactModal';

type Contact = {
  id?: string;
  name: string;
  phone: string;
  relation: string;
  isActive: boolean;
};

type ContactsCardProps = {
  userId: string;
  editable?: boolean;
  realtime?: boolean;
};

export default function ContactsCard({ userId, editable = false, realtime = false }: ContactsCardProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const data = await getActiveContacts(userId);
      if (data) {
        setContacts((data as Contact[]).slice(0, 3));
      } else {
        setContacts([]);
      }
    } catch (error) {
      devLog('[ContactsCard] erro ao carregar contatos', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (realtime) {
      setIsLoading(true);
      const unsub = subscribeActiveContacts(userId, (data) => {
        try {
          if (data) setContacts((data as Contact[]).slice(0, 3));
          else setContacts([]);
        } catch (e) {
          devLog('[ContactsCard] erro ao processar dados realtime', e);
        } finally {
          setIsLoading(false);
        }
      });

      return () => {
        try {
          unsub && unsub();
        } catch (e) {
          // ignore
        }
      };
    }

    fetchContacts();
  }, [userId, realtime]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>👥 Contatos de Emergência</Text>

      {isLoading ? (
        <ActivityIndicator color="#666" size="small" style={styles.loader} />
      ) : contacts.length > 0 ? (
        <View style={styles.contactsList}>
          {contacts.map((contact, index) => (
            <View key={index} style={styles.contactItem}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              <Text style={styles.contactRelation}>{contact.relation}</Text>
              {editable && (
                <View style={styles.rowButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingContact(contact);
                      setIsModalVisible(true);
                    }}
                    style={styles.smallButton}
                  >
                    <Text style={styles.smallButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={async () => {
                      if (!contact.id) return;
                      try {
                        setIsLoading(true);
                        await deleteActiveContacts(userId, contact.id);
                        await fetchContacts();
                      } catch (e) {
                        devLog('[ContactsCard] erro ao deletar contato', e);
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    style={[styles.smallButton, styles.deleteButton]}
                  >
                    <Text style={[styles.smallButtonText, styles.deleteButtonText]}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Nenhum contato cadastrado</Text>
      )}

      {editable && contacts.length < 3 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingContact(null);
            setIsModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Adicionar Contato</Text>
        </TouchableOpacity>
      )}

      <AddContactModal
        visible={isModalVisible}
        userId={userId}
        onClose={() => {
          setIsModalVisible(false);
          setEditingContact(null);
        }}
        onContactAdded={fetchContacts}
        editingContact={editingContact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  loader: {
    marginVertical: 8,
  },
  contactsList: {
    gap: 10,
  },
  contactItem: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  contactPhone: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  contactRelation: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 8,
  },
  addButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  smallButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
  },
  deleteButtonText: {
    color: '#fff',
  },
});
