const capitalize = (string: string): string => {
  if (typeof string !== "string") {
    throw new Error("`capitalize(string)` expects a string argument.");
  }

  return string.charAt(0).toUpperCase() + string.slice(1);
};

const validCurrencies = Intl.supportedValuesOf("currency");

const isValidCurrency = (currency: string): boolean =>
  validCurrencies.includes(currency?.toUpperCase());

/**
 * Formats a number as currency with optional suffix and threshold
 * @param {number} value - The number to format
 * @param {string} [currency='USD'] - The currency code (e.g., 'USD', 'ZAR')
 * @param {number} [digits=2] - Number of decimal places
 * @param {number} [minBreakpoint=1e9] - If number exceeds this, format with suffix
 * @param {('code'|'symbol'|'narrowSymbol'|'name')} [currencyDisplay='narrowSymbol'] - How to display the currency:
 *  - 'code': Shows currency code (e.g., "USD 1.5M")
 *  - 'symbol': Shows currency symbol (e.g., "US$1.5M")
 *  - 'narrowSymbol': Shows narrow currency symbol (e.g., "$1.5M")
 *  - 'name': Shows currency name (e.g., "1.5M United States dollars")
 * @returns {string} Formatted currency string
 */
type CurrencyDisplay = "code" | "symbol" | "narrowSymbol" | "name";

function getCurrencyDisplay(
  currency: string | null | undefined,
  display: CurrencyDisplay = "narrowSymbol"
): string {
  if (!(currency && isValidCurrency(currency))) {
    return "";
  }

  const formatter = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
    currencyDisplay: display,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  const parts = formatter.formatToParts(0);
  const currencySymbol = parts.find((part) => part.type === "currency")?.value;

  return currencySymbol ?? "";
}

type FormatNumberOptions = Omit<
  Intl.NumberFormatOptions,
  "minimumFractionDigits" | "maximumFractionDigits"
> & {
  /**
   * @default 2
   * @description Number of decimal places.
   */
  digits?: number;
  /**
   * @default 1e6
   * @description If the number is greater than this threshold, use the compact notation.
   */
  compactThreshold?: 0 | 1e3 | 1e6 | 1e9 | 1e12 | 1e15;
};

function formatNumber(
  value: number | null | undefined,
  options: FormatNumberOptions = {}
): string {
  const currencyIsValid =
    options.currency &&
    isValidCurrency(options.currency) &&
    options.style === "currency";
  let style = options.style ?? "decimal";
  if (style === "currency" && !currencyIsValid) {
    style = "decimal";
  }
  let notation = options.notation ?? "compact";
  const compactThreshold = options.compactThreshold ?? 1e6;
  if (
    compactThreshold &&
    notation === "compact" &&
    Math.abs(value ?? 0) < compactThreshold
  ) {
    notation = "standard";
  }

  const formatOptions: Intl.NumberFormatOptions = {
    ...options,
    style,
    currency: currencyIsValid ? options.currency : undefined,
    currencyDisplay: options.currencyDisplay ?? "narrowSymbol",
    minimumFractionDigits: options.digits ?? 2,
    maximumFractionDigits: options.digits ?? 2,
    notation,
    signDisplay: options.signDisplay ?? "auto",
  };

  return (value ?? 0).toLocaleString("en-GB", formatOptions);
}

export { capitalize, formatNumber, getCurrencyDisplay };
