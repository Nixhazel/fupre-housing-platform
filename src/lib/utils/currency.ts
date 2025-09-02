/**
 * Format a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @returns Formatted currency string with ₦ symbol
 */
export function formatNaira(amount: number): string {
	return new Intl.NumberFormat('en-NG', {
		style: 'currency',
		currency: 'NGN',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
}

/**
 * Format a number with thousands separators
 * @param amount - The amount to format
 * @returns Formatted number string
 */
export function formatNumber(amount: number): string {
	return new Intl.NumberFormat('en-NG').format(amount);
}

/**
 * Parse a currency string to a number
 * @param currencyString - The currency string to parse
 * @returns The parsed number
 */
export function parseNaira(currencyString: string): number {
	return parseFloat(currencyString.replace(/[₦,]/g, ''));
}
