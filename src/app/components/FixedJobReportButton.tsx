import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator, View } from 'react-native';
import { useSession } from 'next-auth/react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type FixedJobReportButtonProps = {
  userId: string;
  userName: string;
};

const FixedJobReportButton: React.FC<FixedJobReportButtonProps> = ({ userId, userName }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'start' | 'end'>('start');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleGenerateReport = async () => {
    if (!session?.user?.token) {
      Alert.alert('Erro', 'Você precisa estar autenticado para gerar relatórios.');
      return;
    }

    setLoading(true);

    try {
      // Formatar datas para a API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      // Construir URL da API
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/reports/fixedJobReport?userId=${userId}&startDate=${formattedStartDate}&endDate=${formattedEndDate}&token=${session.user.token}`;

      // Baixar o PDF
      const downloadResumable = FileSystem.createDownloadResumable(
        apiUrl,
        FileSystem.documentDirectory + `relatorio-${userId}-${formattedStartDate}-${formattedEndDate}.pdf`,
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );

      const { uri } = await downloadResumable.downloadAsync();

      if (uri) {
        // Verificar se o compartilhamento está disponível
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Relatório de ${userName}`,
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert(
            'Sucesso',
            `Relatório salvo em: ${uri}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error('Falha ao baixar o relatório');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const showDatePickerModal = (mode: 'start' | 'end') => {
    setDatePickerMode(mode);
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    
    if (selectedDate) {
      if (datePickerMode === 'start') {
        setStartDate(selectedDate);
        
        // Se a data de início for posterior à data de fim, ajustar a data de fim
        if (selectedDate > endDate) {
          setEndDate(selectedDate);
        }
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.dateContainer}>
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => showDatePickerModal('start')}
        >
          <Text style={styles.dateButtonText}>
            De: {format(startDate, 'dd/MM/yyyy', { locale: ptBR })}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => showDatePickerModal('end')}
        >
          <Text style={styles.dateButtonText}>
            Até: {format(endDate, 'dd/MM/yyyy', { locale: ptBR })}
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleGenerateReport}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Gerar Relatório de Trabalho</Text>
        )}
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={datePickerMode === 'start' ? startDate : endDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
  },
  dateButtonText: {
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FixedJobReportButton; 