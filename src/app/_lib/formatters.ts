/**
 * Formata um valor numérico para o formato de moeda brasileira (R$)
 * @param value Valor a ser formatado
 * @returns String formatada no padrão de moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 * @param date Data a ser formatada
 * @returns String formatada no padrão brasileiro
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR').format(dateObj);
}

/**
 * Formata um horário para o formato HH:MM
 * @param date Data/hora a ser formatada
 * @returns String formatada no padrão HH:MM
 */
export function formatTime(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
} 