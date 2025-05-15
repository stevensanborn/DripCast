import { monetization } from "@/db/schema";
import { monetizationPayments } from "@/db/schema";
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

export const formatDurationSecs = (duration:number) => {
  const hours = Math.floor(duration / 3600);
  let remaining = duration % 3600;
  const minutes = Math.floor(remaining / 60);
  remaining = remaining % 60;
  const seconds = Math.floor(remaining);
  const milliseconds = Math.floor((remaining - seconds) * 100);
  let time = ''
  if(hours > 0  ){
    time = `${hours.toString().padStart(1, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }else if(minutes > 0){
    time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }else{
    time = `${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`
  }
  return time;
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

export const getHexHash = async (text: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  // Take first 12 bytes (96 bits) and convert to base64
  const hashArray = new Uint8Array(hashBuffer.slice(0, 12));
  // Convert to base64 and remove padding
  return btoa(String.fromCharCode(...hashArray)).replace(/=/g, '');
}

export const timeLeftForPayment =  (mon:typeof monetization.$inferSelect,
  payment:typeof monetizationPayments.$inferSelect)=>{
  if(!!mon.duration === false) return -1 //no duration so no expiry set

  const date = new Date();
  const msecondsNow = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
  const msecondsLastPayment = new Date(payment.updatedAt).getTime()
  const msecondsExpiry = msecondsLastPayment + (mon.duration *1000)
  const msecondsLeft = msecondsExpiry - msecondsNow
 
  return Math.round(msecondsLeft/1000)
}

export const toTime = (seconds:number)=>{
  if(seconds < 0) return '0'
  const days     = Math.floor(seconds / (24*60*60));
      seconds -= days    * (24*60*60);
  const hours    = Math.floor(seconds / (60*60));
      seconds -= hours   * (60*60);
  const minutes  = Math.floor(seconds / (60));
      seconds -= minutes * (60);
      let time = ''
      if(days > 0){
        time = `${days}d ${hours}h ${minutes}m ${seconds}s`
      }else if(hours > 0){
        time = `${hours}h ${minutes}m ${seconds}s`
      }else{
        time = `${minutes}m ${seconds}s`
      }
      return time;
   }