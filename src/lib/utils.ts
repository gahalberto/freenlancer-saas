import { clsx, type ClassValue } from 'clsx' // Importa o tipo ClassValue
import { twMerge } from 'tailwind-merge'

/**
 * Combina classes utilitárias com Tailwind, garantindo que classes duplicadas sejam mescladas.
 * Exemplo: `bg-red-500 bg-blue-500` se torna `bg-blue-500`.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
