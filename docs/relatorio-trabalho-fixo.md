# Guia de Uso: Relatório de Trabalho Fixo

Este guia explica como usar o endpoint de geração de relatórios de trabalho fixo e o componente React Native para download de PDF.

## Endpoint de API

O endpoint `/api/reports/fixedJobReport` gera um relatório em PDF dos trabalhos fixos de um mashguiach, calculando as horas trabalhadas e os valores com base nos registros de tempo (TimeEntries) e na taxa horária (price_per_hour).

### Parâmetros da Requisição

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| userId | string | Sim | ID do usuário (mashguiach) |
| startDate | string | * | Data de início no formato YYYY-MM-DD |
| endDate | string | * | Data de fim no formato YYYY-MM-DD |
| month | number | * | Mês (1-12) |
| year | number | * | Ano (ex: 2023) |
| token | string | Sim | Token de autenticação (pode ser enviado como parâmetro ou no cabeçalho Authorization) |

\* É obrigatório fornecer ou o par `startDate` e `endDate` ou o par `month` e `year`.

### Exemplo de Requisição

```
GET /api/reports/fixedJobReport?userId=123&startDate=2023-01-01&endDate=2023-01-31&token=seu_token_aqui
```

ou

```
GET /api/reports/fixedJobReport?userId=123&month=1&year=2023&token=seu_token_aqui
```

### Resposta

O endpoint retorna um arquivo PDF com:

1. Informações do mashguiach (nome, email, telefone, endereço)
2. Resumo por estabelecimento:
   - Nome e localização do estabelecimento
   - Valor por hora
   - Total de horas trabalhadas
   - Valor total
3. Detalhes dos dias trabalhados:
   - Data
   - Horário de entrada e saída
   - Horário de almoço (início e fim)
   - Horas trabalhadas
4. Total geral de todos os estabelecimentos

## Componente React Native

O componente `FixedJobReportButton` permite que os usuários selecionem um período e gerem/baixem o relatório em PDF.

### Instalação de Dependências

```bash
npm install expo-file-system expo-sharing @react-native-community/datetimepicker date-fns
```

### Propriedades do Componente

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| userId | string | ID do usuário (mashguiach) |
| userName | string | Nome do usuário (para o título do relatório) |

### Exemplo de Uso

```jsx
import React from 'react';
import { View, Text } from 'react-native';
import FixedJobReportButton from '../components/FixedJobReportButton';

const MashguiachProfileScreen = ({ route }) => {
  const { mashguiach } = route.params;

  return (
    <View>
      <Text>Perfil de {mashguiach.name}</Text>
      
      {/* Botão de relatório */}
      <FixedJobReportButton 
        userId={mashguiach.id} 
        userName={mashguiach.name} 
      />
    </View>
  );
};

export default MashguiachProfileScreen;
```

### Funcionalidades do Componente

1. Seleção de período (data de início e fim)
2. Download do PDF usando expo-file-system
3. Compartilhamento do PDF usando expo-sharing
4. Indicador de carregamento durante o download
5. Tratamento de erros com alertas

## Conteúdo do Relatório

O relatório PDF inclui:

1. **Cabeçalho**:
   - Título "Relatório de Trabalho Fixo"
   - Período do relatório

2. **Informações do Mashguiach**:
   - Nome, email, telefone
   - Endereço completo (se disponível)

3. **Resumo por Estabelecimento**:
   - Nome e localização do estabelecimento
   - Valor por hora
   - Total de horas trabalhadas
   - Valor total

4. **Detalhes dos Dias Trabalhados**:
   - Tabela com data, horários de entrada/saída, almoço e horas trabalhadas

5. **Total Geral**:
   - Soma dos valores de todos os estabelecimentos

6. **Rodapé**:
   - Data e hora de geração do relatório

## Cálculo de Horas e Valores

O sistema calcula:

1. **Horas trabalhadas**: Diferença entre horário de saída e entrada, subtraindo o tempo de almoço (se houver)
2. **Valor total**: Horas trabalhadas × valor por hora (price_per_hour) do trabalho fixo

## Requisitos de Segurança

- O endpoint requer autenticação via token
- Apenas usuários autenticados podem gerar relatórios
- O relatório só pode ser gerado para o próprio usuário ou por administradores 