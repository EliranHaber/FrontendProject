import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Divider
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import currencyService from '../services/currencyService';

const Settings = () => {
    const [exchangeRateUrl, setExchangeRateUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [currentRates, setCurrentRates] = useState({});

    useEffect(() => {
        // Load saved URL from localStorage
        const savedUrl = localStorage.getItem('exchangeRateUrl');
        if (savedUrl) {
            setExchangeRateUrl(savedUrl);
            currencyService.setExchangeRateUrl(savedUrl);
        }
        
        // Display current exchange rates
        setCurrentRates(currencyService.getExchangeRates());
    }, []);

    const handleSaveUrl = () => {
        if (!exchangeRateUrl.trim()) {
            setMessage({ type: 'error', text: 'Please enter a valid URL' });
            return;
        }

        try {
            // Validate URL format
            new URL(exchangeRateUrl);
            
            // Save to localStorage and service
            localStorage.setItem('exchangeRateUrl', exchangeRateUrl);
            currencyService.setExchangeRateUrl(exchangeRateUrl);
            
            setMessage({ type: 'success', text: 'Exchange rate URL saved successfully!' });
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            
        } catch (error) {
            setMessage({ type: 'error', text: 'Please enter a valid URL' });
        }
    };

    const handleTestConnection = async () => {
        if (!exchangeRateUrl.trim()) {
            setMessage({ type: 'error', text: 'Please enter a URL first' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const rates = await currencyService.fetchExchangeRates();
            setCurrentRates(rates);
            setMessage({ type: 'success', text: 'Connection successful! Exchange rates updated.' });
            
            // Clear message after 5 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            
        } catch (error) {
            setMessage({ type: 'error', text: `Connection failed: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearUrl = () => {
        setExchangeRateUrl('');
        localStorage.removeItem('exchangeRateUrl');
        currencyService.setExchangeRateUrl(null);
        setMessage({ type: 'success', text: 'Exchange rate URL cleared' });
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleClearDatabase = async () => {
        try {
            await window.idb.clearAll();
            setMessage({ type: 'success', text: 'All cost data cleared from IndexedDB.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to clear database.' });
        }
    };

    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Application Settings
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                        Currency Exchange Rates
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Configure the URL for fetching currency exchange rates. The URL should return JSON data in the format:
                        {`{"USD": 1, "GBP": 1.8, "EURO": 0.7, "ILS": 3.4}`}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Exchange Rate URL"
                            value={exchangeRateUrl}
                            onChange={(e) => setExchangeRateUrl(e.target.value)}
                            placeholder="https://example.com/exchange-rates.json"
                            size="small"
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSaveUrl}
                            size="small"
                        >
                            Save URL
                        </Button>
                        
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleTestConnection}
                            disabled={isLoading || !exchangeRateUrl.trim()}
                            size="small"
                        >
                            {isLoading ? 'Testing...' : 'Test Connection'}
                        </Button>
                        
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleClearUrl}
                            size="small"
                        >
                            Clear
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleClearDatabase}
                            size="small"
                        >
                            Clear Database
                        </Button>
                    </Box>

                    {message.text && (
                        <Alert 
                            severity={message.type} 
                            sx={{ mt: 2 }}
                            onClose={() => setMessage({ type: '', text: '' })}
                        >
                            {message.text}
                        </Alert>
                    )}
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                        Current Exchange Rates
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Current exchange rates (1 USD = ?)
                    </Typography>

                    <Box sx={{ display: 'grid', gap: 1 }}>
                        {Object.entries(currentRates).map(([currency, rate]) => (
                            <Box 
                                key={currency} 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    p: 1,
                                    bgcolor: 'grey.50',
                                    borderRadius: 1
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                    {currency}
                                </Typography>
                                <Typography variant="body2">
                                    {rate.toFixed(4)}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary">
                        Note: Exchange rates are automatically updated when you test the connection or when reports/charts are generated.
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default Settings;
