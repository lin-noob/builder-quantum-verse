import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (
  locale: string,
  style: string,
  code: string,
  amount: number,
) => {
  return new Intl.NumberFormat(locale, {
    style: style,
    currency: code,
    minimumFractionDigits: 2,
  }).format(amount);
};

export function getDaysBetween(date1, date2) {
  if (!date1 || !date2) {
    return 0;
  }

  // 转成时间戳（避免时区影响建议用 UTC 零点）
  const start = new Date(date1).setHours(0, 0, 0, 0);
  const end = new Date(date2).setHours(0, 0, 0, 0);

  const diff = Math.abs(end - start); // 毫秒差
  return Math.round(diff / (1000 * 60 * 60 * 24)) + 1; // 转成天数
}
