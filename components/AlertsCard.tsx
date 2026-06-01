import { getAlert } from '@/src/services/firebase/alert.service';
import { devLog } from '@/src/utils/dev-log';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

type Alert = {
  location: string;
  geolocation?: { latitude: number; longitude: number };
  startedAt?: any;
  actualAlert: boolean;
};

type AlertsCardProps = {
  userId: string;
};

function formatDate(timestamp: any): string {
  if (!timestamp) return 'Data desconhecida';

  let date: Date;

  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    return 'Data desconhecida';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;

  return date.toLocaleDateString('pt-BR');
}

export default function AlertsCard({ userId }: AlertsCardProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        const data = await getAlert(userId);
        if (data) {
          const sorted = (data as Alert[])
            .sort((a, b) => {
              const dateA = a.startedAt?.toDate?.() || new Date(0);
              const dateB = b.startedAt?.toDate?.() || new Date(0);
              return dateB.getTime() - dateA.getTime();
            })
            .slice(0, 3);
          setAlerts(sorted);
        }
      } catch (error) {
        devLog('[AlertsCard] erro ao carregar alertas', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [userId]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🚨 Últimas Chamadas de Emergência</Text>

      {isLoading ? (
        <ActivityIndicator color="#666" size="small" style={styles.loader} />
      ) : alerts.length > 0 ? (
        <View style={styles.alertsList}>
          {alerts.map((alert, index) => (
            <View key={index} style={styles.alertItem}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertTime}>
                  {formatDate(alert.startedAt)}
                </Text>
                {alert.actualAlert && (
                  <Text style={styles.badge}>Ativa</Text>
                )}
              </View>
              <Text style={styles.alertLocation} numberOfLines={1}>
                📍 {alert.location}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>Nenhuma chamada registrada</Text>
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
  alertsList: {
    gap: 10,
  },
  alertItem: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  alertLocation: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 8,
  },
});
