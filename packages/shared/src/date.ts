export const now = (): Date => new Date();

export const toISOString = (date: Date): string => date.toISOString();

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const isExpired = (date: Date): boolean => date.getTime() < Date.now();
