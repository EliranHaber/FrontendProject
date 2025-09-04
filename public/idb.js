// IndexedDB wrapper library for cost management application
// This library provides Promise-based access to IndexedDB for storing and retrieving cost data

const storeName = "expenses";

// Global database object that will be accessible when script is loaded
window.idb = {};

/**
 * Opens or creates the IndexedDB database
 * @param {string} databaseName - Name of the database
 * @param {number} databaseVersion - Version number for the database
 * @returns {Promise} Promise that resolves to the database object
 */
window.idb.openCostsDB = function(databaseName, databaseVersion) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, databaseVersion);
        
        request.onerror = () => {
            reject(new Error("Failed to open database"));
        };
        
        request.onsuccess = () => {
            const db = request.result;
            // Return a small wrapper so callers can do: const db = await idb.openCostsDB(...); await db.addCost(...)
            resolve({
                addCost: window.idb.addCost,
                getReport: window.idb.getReport,
                clearAll: window.idb.clearAll,
                loadExchangeRates: window.idb.loadExchangeRates,
                // expose the raw IndexedDB handle if needed
                raw: db
            });
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(storeName)) {
                const store = db.createObjectStore(storeName, { 
                    keyPath: "id", 
                    autoIncrement: true 
                });
                
                // Create indexes for efficient querying
                store.createIndex("date", "date", { unique: false });
                store.createIndex("year", "year", { unique: false });
                store.createIndex("month", "month", { unique: false });
                store.createIndex("category", "category", { unique: false });
            }
        };
    });
};

/**
 * Adds a new cost item to the database
 * @param {Object} cost - Cost object with sum, currency, category, and description
 * @returns {Promise} Promise that resolves to the newly added cost item
 */
window.idb.addCost = function(cost) {
    return new Promise((resolve, reject) => {
        // Validate required properties
        if (!cost.sum || !cost.currency || !cost.category || !cost.description) {
            reject(new Error("Missing required properties: sum, currency, category, description"));
            return;
        }
        
        // Get current date
        const now = new Date();
        const costItem = {
            sum: cost.sum,
            currency: cost.currency,
            category: cost.category,
            description: cost.description,
            date: now,
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate()
        };
        
        // Get database instance and add cost
        window.idb.openCostsDB("costsdb", 1).then(({ raw }) => {
            const transaction = raw.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);
            
            const request = store.add(costItem);
            
            request.onsuccess = () => {
                // Return strictly the fields required by the spec
                resolve({
                    sum: costItem.sum,
                    currency: costItem.currency,
                    category: costItem.category,
                    description: costItem.description
                });
            };
            
            request.onerror = () => {
                reject(new Error("Failed to add cost item"));
            };
        }).catch(reject);
    });
};

/**
 * Gets a detailed report for a specific month and year in the specified currency
 * @param {number} year - Year for the report
 * @param {number} month - Month for the report (1-12)
 * @param {string} currency - Target currency for the report
 * @returns {Promise} Promise that resolves to the report object
 */
window.idb.getReport = function(year, month, currency) {
    return new Promise((resolve, reject) => {
        window.idb.openCostsDB("costsdb", 1).then(({ raw }) => {
            const transaction = raw.transaction([storeName], "readonly");
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                const allCosts = request.result;
                
                // Filter costs for the specified month and year
                const monthCosts = allCosts.filter(cost => 
                    cost.year === year && cost.month === month
                );
                
                // Get exchange rates (fallback defaults)
                const fallbackRates = { USD: 1, GBP: 1.8, EURO: 0.7, ILS: 3.4 };
                const rates = (typeof window !== 'undefined' && window.idb && window.idb.exchangeRates)
                    ? window.idb.exchangeRates
                    : fallbackRates;

                // Helper to convert via USD
                const convert = (amount, fromCurrency, toCurrency) => {
                    if (!amount || fromCurrency === toCurrency) { return amount; }
                    const fromRate = rates[fromCurrency];
                    const toRate = rates[toCurrency];
                    if (!fromRate || !toRate) { return amount; }
                    const usdAmount = amount / fromRate;
                    return usdAmount * toRate;
                };

                // Prepare costs with convertedSum in target currency while keeping original currency
                const detailedCosts = monthCosts.map(cost => {
                    const convertedSum = convert(cost.sum, cost.currency, currency);
                    return {
                        sum: cost.sum,
                        currency: cost.currency,
                        category: cost.category,
                        description: cost.description,
                        Date: { day: cost.day },
                        convertedSum: typeof convertedSum === 'number' ? convertedSum : cost.sum
                    };
                });
                
                // Calculate total
                const total = detailedCosts.reduce((sum, cost) => sum + (cost.convertedSum || 0), 0);
                
                const report = {
                    year: year,
                    month: month,
                    costs: detailedCosts,
                    total: { currency: currency, total: total }
                };
                
                resolve(report);
            };
            
            request.onerror = () => {
                reject(new Error("Failed to retrieve costs"));
            };
        }).catch(reject);
    });
};

/**
 * Clears all cost items from the database (useful for testing)
 * @returns {Promise<void>}
 */
window.idb.clearAll = function() {
    return new Promise((resolve, reject) => {
        window.idb.openCostsDB("costsdb", 1).then(({ raw }) => {
            const transaction = raw.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);
            const req = store.clear();
            req.onsuccess = () => resolve();
            req.onerror = () => reject(new Error("Failed to clear database"));
        }).catch(reject);
    });
};

// Backwards compatibility for any code referring to window.db
window.db = window.idb;

/**
 * Loads exchange rates JSON from a URL and caches it on window.idb.exchangeRates
 * @param {string} url - URL to a JSON file or API returning an object like { USD:1, GBP:2, EURO:0.7, ILS:3.4 }
 * @returns {Promise<Object>} The loaded rates object
 */
window.idb.loadExchangeRates = function(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) { throw new Error("Failed to fetch exchange rates"); }
            return response.json();
        })
        .then(rates => {
            window.idb.exchangeRates = rates;
            return rates;
        });
};
