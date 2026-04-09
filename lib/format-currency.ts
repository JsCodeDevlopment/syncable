/**
 * Formats a number as a currency string based on the provided currency code.
 * Supported currencies: BRL, USD, EUR, GBP.
 */
export function formatCurrency(amount: number, currencyCode: string = "BRL"): string {
  const locale = currencyCode === "BRL" ? "pt-BR" : currencyCode === "USD" ? "en-US" : currencyCode === "GBP" ? "en-GB" : "de-DE";
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}
