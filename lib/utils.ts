import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
} 

export const formatDate = (date: Date | string): string => {
  if (!date) return '-';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
}

export const formatISODate = (date: string | Date | null): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const getInitials = (name: string) => {
  const words = name.split(' ');
  return words.length > 1 
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : words[0][0].toUpperCase();
};

export const stripHtmlTags = (html: string | null) => {
  if (!html) return '-';
  return html.replace(/<[^>]*>/g, '');
};

export const generateId = ( prefix?: string ) => {
  const year = new Date().getFullYear();
  const month = formatMonth(new Date().getMonth() + 1);
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(6, '0');
  return `${prefix}/${year}/${month}/${randomNum}`;
};

export const formatMonth = (month: number): string => {
  return month.toString().padStart(2, '0');
};

