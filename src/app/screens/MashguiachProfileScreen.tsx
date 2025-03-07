import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import FixedJobReportButton from '../components/FixedJobReportButton';

// Exemplo de tela de perfil do Mashguiach que inclui o botão de relatório
const MashguiachProfileScreen = () => {
  const route = useRoute();
  const { mashguiach } = route.params as { mashguiach: any };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil do Mashguiach</Text>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.name}>{mashguiach.name}</Text>
          <Text style={styles.info}>Email: {mashguiach.email}</Text>
          <Text style={styles.info}>Telefone: {mashguiach.phone || 'Não informado'}</Text>
          
          {/* Outras informações do perfil */}
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Relatórios</Text>
          <Text style={styles.description}>
            Gere relatórios de trabalho fixo para visualizar horas trabalhadas e valores.
          </Text>
          
          {/* Componente de botão para gerar relatório */}
          <FixedJobReportButton 
            userId={mashguiach.id} 
            userName={mashguiach.name} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#2563EB',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
});

export default MashguiachProfileScreen; 