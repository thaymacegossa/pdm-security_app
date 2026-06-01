import { getActiveContacts } from '@/src/services/firebase/activeContacts.service';
import { devLog } from '@/src/utils/dev-log';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type Contact = {
  name: string;
  phone: string;
  relation: string;
  isActive: boolean;
};

type ContactsCardProps = {
  userId: string;
};

export default function ContactsCard({ userId }: ContactsCardProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const data = await getActiveContacts(userId);
        if (data) {
          setContacts((data as Contact[]).slice(0, 3));
        }
      } catch (error) {
        devLog('[ContactsCard] erro ao carregar contatos', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [userId]);

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
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Nenhum contato cadastrado</Text>
      )}
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
});
