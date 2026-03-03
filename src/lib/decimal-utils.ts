import { Decimal } from '@prisma/client/runtime/library';

/**
 * Safely convert Decimal or number to number
 * @param value Decimal or number value
 * @returns number representation
 */
export function toNumber(value: number | Decimal): number {
  if (typeof value === 'number') return value;
  return Number(value);
}

/**
 * Sum an array of Decimal or number values
 * @param values Array of Decimal or number values
 * @returns Total as number
 */
export function sumDecimals(values: (number | Decimal)[]): number {
  return values.reduce((acc: number, val) => acc + toNumber(val), 0);
}
