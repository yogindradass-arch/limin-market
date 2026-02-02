// Currency conversion utilities
// Exchange rate: 1 USD = ~215 GYD (approximate, updated periodically)

const GYD_TO_USD_RATE = 215;

export function convertPrice(priceGYD: number, toCurrency: 'GYD' | 'USD'): number {
  if (toCurrency === 'USD') {
    return priceGYD / GYD_TO_USD_RATE;
  }
  return priceGYD;
}

export function formatPrice(priceGYD: number, currency: 'GYD' | 'USD'): string {
  const convertedPrice = convertPrice(priceGYD, currency);

  if (currency === 'USD') {
    return `$${convertedPrice.toFixed(2)} USD`;
  }
  return `$${convertedPrice.toFixed(2)} GYD`;
}

export function getCurrencySymbol(currency: 'GYD' | 'USD'): string {
  return currency === 'USD' ? '🇺🇸' : '🇬🇾';
}
