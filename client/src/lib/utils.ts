import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string | undefined, chars = 4): string {
  if (!address) return "";
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
}

export function formatTimestamp(timestamp: number | string | Date): string {
  if (!timestamp) return "";
  
  try {
    const date = typeof timestamp === "string" || typeof timestamp === "number"
      ? new Date(timestamp)
      : timestamp;
    
    if (isNaN(date.getTime())) return "";
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "";
  }
}

export function formatMatic(value: string | number): string {
  if (typeof value === "string") {
    value = parseFloat(value);
  }
  
  if (isNaN(value)) return "0.00 MATIC";
  
  return `${value.toFixed(3)} MATIC`;
}

export function parseEther(value: string): string {
  try {
    return ethers.parseEther(value).toString();
  } catch (error) {
    console.error("Error parsing ether value:", error);
    return "0";
  }
}

export function formatEther(value: string): string {
  try {
    return ethers.formatEther(value);
  } catch (error) {
    console.error("Error formatting ether value:", error);
    return "0";
  }
}

export function jobStatusColor(status: string): {
  bgColor: string;
  textColor: string;
} {
  switch (status.toLowerCase()) {
    case "completed":
      return { bgColor: "bg-status-success-10", textColor: "text-status-success" };
    case "processing":
      return { bgColor: "bg-status-info-10", textColor: "text-status-info" };
    case "queued":
      return { bgColor: "bg-status-warning-10", textColor: "text-status-warning" };
    case "failed":
      return { bgColor: "bg-status-error-10", textColor: "text-status-error" };
    default:
      return { bgColor: "bg-neutral-lighter", textColor: "text-neutral" };
  }
}

export function getProgressFromStatus(status: string): number {
  // Extract percentage from status like "Processing (75%)"
  const match = status.match(/\((\d+)%\)/);
  return match ? parseInt(match[1], 10) : 0;
}
