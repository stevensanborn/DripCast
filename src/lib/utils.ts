import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatDuration = (duration:number) => {
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export const snakeCaseToTitleCase = (str:string) => {
  return str.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}


export const MONETIZATION_TYPES = [
  {
    name: 'Purchase',
    value: 'purchase',
  },
  {
    name: 'Purchase Snippet',
    value: 'snippet',
  },
  {
    name: 'Pay Per Minute',
    value: 'payperminute',
  },
]

export const getMonetizationType = (value:string) => {
  return MONETIZATION_TYPES.find((type) => type.value === value)?.name;
}

export const getMonetizationTypeValue = (name:string) => {
  return MONETIZATION_TYPES.find((type) => type.name === name)?.value;
}
