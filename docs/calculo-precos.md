# Documentação de Cálculo de Preços

## Visão Geral

Este documento explica como o sistema calcula os preços dos serviços de Mashguiach com base nos horários diurnos e noturnos.

## Valores Padrão

- **Valor da Hora Diurna**: R$ 50,00 (padrão, pode ser personalizado)
- **Valor da Hora Noturna**: R$ 75,00 (padrão, pode ser personalizado)
- **Horário Diurno**: Das 06:00 às 22:00
- **Horário Noturno**: Das 22:00 às 06:00
- **Preço Mínimo**: R$ 250,00 (equivalente a 5 horas diurnas)

## Algoritmo de Cálculo

O sistema utiliza um algoritmo preciso para calcular o preço total do serviço:

1. **Divisão em Intervalos**: O período entre o horário de início e término é dividido em intervalos de 15 minutos para maior precisão.

2. **Classificação de Horas**: Cada intervalo de 15 minutos é classificado como:
   - **Diurno**: Se o horário estiver entre 06:00 e 22:00
   - **Noturno**: Se o horário estiver entre 22:00 e 06:00

3. **Cálculo do Valor**:
   - Total de horas diurnas × Valor da hora diurna
   - Total de horas noturnas × Valor da hora noturna
   - Soma dos dois valores = Preço total do serviço

4. **Ajuste de Precisão**: O algoritmo ajusta o último intervalo para evitar contagem excessiva de horas.

## Exemplo de Cálculo

Para um serviço das 20:00 às 23:00 com valores padrão:

1. **Horas Diurnas**: 2 horas (20:00-22:00) = 2 × R$ 50,00 = R$ 100,00
2. **Horas Noturnas**: 1 hora (22:00-23:00) = 1 × R$ 75,00 = R$ 75,00
3. **Total**: R$ 175,00

## Atualização Automática

Quando você edita os valores de hora diurna/noturna ou altera os horários de início/término, o sistema automaticamente:

1. Recalcula as horas diurnas e noturnas
2. Aplica os novos valores por hora
3. Atualiza o preço total (mashguiachPrice)
4. Exibe uma estimativa em tempo real na interface

## Implementação no Frontend

No componente `EditDatesModal.tsx`, você pode ver uma estimativa de preço em tempo real que mostra:

- Total de horas diurnas
- Total de horas noturnas
- Valor das horas diurnas
- Valor das horas noturnas
- Valor total estimado

## Implementação no Backend

Quando o serviço é atualizado através da API, o sistema:

1. Valida os novos valores de hora diurna/noturna
2. Recalcula o preço total com base nos horários e valores atualizados
3. Atualiza o campo `mashguiachPrice` no banco de dados

## Considerações Importantes

- Os valores de hora podem ser personalizados para cada serviço
- O cálculo é feito em intervalos de 15 minutos para maior precisão
- O sistema considera a transição entre horário diurno e noturno
- O preço é atualizado automaticamente quando os valores ou horários são alterados

## Fluxo de Dados

1. O usuário edita os valores de hora ou horários no frontend
2. O frontend calcula e exibe uma estimativa em tempo real
3. Ao salvar, os dados são enviados para o backend
4. O backend recalcula o preço total e atualiza o banco de dados
5. O frontend exibe o preço atualizado

## Depuração

O sistema inclui logs de console que mostram:
- Horários de início e término
- Valores de hora diurna e noturna
- Horas calculadas (diurnas e noturnas)
- Valores calculados
- Preço total 