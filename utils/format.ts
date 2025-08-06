// utils/format.ts

/**
 * Format a date to a human-readable string
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'N/A';
  }
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number | undefined): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    console.warn('Error formatting currency:', error);
    return `$${amount.toFixed(2)}`;
  }
}
