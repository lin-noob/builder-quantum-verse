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

/**
 * 将日期格式化为当天开始时间的字符串 (00:00:00)
 * @param date 日期对象
 * @returns 格式化后的日期字符串 (YYYY-MM-DDTHH:mm:ss.SSSZ)
 */
export function formatStartDate(date: Date): string {
  // 创建一个新的Date对象，设置时间为当天的00:00:00
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * 将日期格式化为当天结束时间的字符串 (23:59:59)
 * @param date 日期对象
 * @returns 格式化后的日期字符串 (YYYY-MM-DDTHH:mm:ss.SSSZ)
 */
export function formatEndDate(date: Date): string {
  // 创建一个新的Date对象，设置时间为当天的23:59:59
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}
