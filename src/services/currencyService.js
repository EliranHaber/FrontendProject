// Currency exchange service for handling multiple currencies
// Supports USD, ILS, GBP, and EURO

class CurrencyService {
    constructor() {
        this.exchangeRates = {
            USD: 1,
            GBP: 1.8,
            EURO: 0.7,
            ILS: 3.4
        };
        this.exchangeRateUrl = null;
    }

    /**
     * Sets the URL for fetching exchange rates
     * @param {string} url - URL to fetch exchange rates from
     */
    setExchangeRateUrl(url) {
        this.exchangeRateUrl = url;
    }

    /**
     * Fetches exchange rates from the configured URL
     * @returns {Promise} Promise that resolves to the exchange rates
     */
    async fetchExchangeRates() {
        if (!this.exchangeRateUrl) {
            throw new Error("Exchange rate URL not configured");
        }

        try {
            const response = await fetch(this.exchangeRateUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rates = await response.json();
            this.exchangeRates = rates;
            // Expose rates to vanilla idb library if available
            if (typeof window !== 'undefined' && window.idb) {
                window.idb.exchangeRates = { ...rates };
            }
            return rates;
        } catch (error) {
            console.error("Failed to fetch exchange rates:", error);
            throw error;
        }
    }

    /**
     * Converts an amount from one currency to another
     * @param {number} amount - Amount to convert
     * @param {string} fromCurrency - Source currency
     * @param {string} toCurrency - Target currency
     * @returns {number} Converted amount
     */
    convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount;
        }

        // Convert to USD first, then to target currency
        const usdAmount = amount / this.exchangeRates[fromCurrency];
        return usdAmount * this.exchangeRates[toCurrency];
    }

    /**
     * Maps app currency codes to ISO codes for Intl.NumberFormat
     */
    toIsoCurrencyCode(code) {
        if (code === 'EURO') return 'EUR';
        return code;
    }

    /**
     * Gets all supported currencies
     * @returns {Array} Array of supported currency codes
     */
    getSupportedCurrencies() {
        return Object.keys(this.exchangeRates);
    }

    /**
     * Gets current exchange rates
     * @returns {Object} Current exchange rates
     */
    getExchangeRates() {
        return { ...this.exchangeRates };
    }
}

// Create singleton instance
const currencyService = new CurrencyService();

export default currencyService;
