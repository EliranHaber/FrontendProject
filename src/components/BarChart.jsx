import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import currencyService from '../services/currencyService';

const BarChart = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const currencies = currencyService.getSupportedCurrencies();
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const generateChartData = async () => {
        if (!window.db) {
            setError('Database not available. Please refresh the page.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Update exchange rates if URL is configured
            if (currencyService.exchangeRateUrl) {
                await currencyService.fetchExchangeRates();
            }

            const monthlyData = [];

            // Get data for each month of the selected year
            for (let month = 1; month <= 12; month++) {
                try {
                    const reportData = await window.db.getReport(selectedYear, month, selectedCurrency);
                    const total = reportData.costs.reduce((sum, cost) => sum + (typeof cost.convertedSum === 'number' ? cost.convertedSum : cost.sum), 0);
                    
                    monthlyData.push({
                        month: months[month - 1],
                        total: Math.round(total * 100) / 100, // Round to 2 decimal places
                        monthNumber: month
                    });
                } catch (err) {
                    // If no data for this month, add 0
                    monthlyData.push({
                        month: months[month - 1],
                        total: 0,
                        monthNumber: month
                    });
                }
            }

            setChartData(monthlyData);
        } catch (err) {
            console.error('Failed to generate chart data:', err);
            setError('Failed to generate chart data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateChartData();
    }, [selectedYear, selectedCurrency]);

    const formatCurrency = (amount, currency) => {
        try {
            const iso = currencyService.toIsoCurrencyCode(currency);
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: iso
            }).format(amount || 0);
        } catch (e) {
            return `${currency} ${Number(amount || 0).toFixed(2)}`;
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Box sx={{ 
                    bgcolor: 'white', 
                    border: '1px solid #ccc', 
                    p: 1, 
                    borderRadius: 1,
                    boxShadow: 2
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {label}
                    </Typography>
                    <Typography variant="body2">
                        {formatCurrency(payload[0].value, selectedCurrency)}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    if (!window.db) {
        return (
            <Paper elevation={3} sx={{ p: 3 }}>
                <Alert severity="warning">
                    Database not available. Please make sure the idb.js library is loaded.
                </Alert>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Yearly Costs by Month
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Year</InputLabel>
                    <Select
                        value={selectedYear}
                        label="Year"
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        {years.map(year => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Currency</InputLabel>
                    <Select
                        value={selectedCurrency}
                        label="Currency"
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                    >
                        {currencies.map(currency => (
                            <MenuItem key={currency} value={currency}>
                                {currency}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : chartData.length > 0 ? (
                <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar 
                                dataKey="total" 
                                fill="#8884d8" 
                                radius={[4, 4, 0, 0]}
                            />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </Box>
            ) : (
                <Alert severity="info">
                    No data available for the selected year.
                </Alert>
            )}
        </Paper>
    );
};

export default BarChart;
