import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    CircularProgress,
    Alert
} from '@mui/material';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import currencyService from '../services/currencyService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4'];

const PieChart = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const currencies = currencyService.getSupportedCurrencies();
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

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

            const reportData = await window.db.getReport(selectedYear, selectedMonth, selectedCurrency);

            // Group costs by category and sum converted amounts
            const categoryTotals = {};
            reportData.costs.forEach(cost => {
                const value = (typeof cost.convertedSum === 'number') ? cost.convertedSum : cost.sum;
                if (categoryTotals[cost.category]) {
                    categoryTotals[cost.category] += value;
                } else {
                    categoryTotals[cost.category] = value;
                }
            });

            // Convert to chart data format
            const data = Object.entries(categoryTotals).map(([category, sum], index) => ({
                name: category,
                value: Math.round(sum * 100) / 100, // Round to 2 decimal places
                color: COLORS[index % COLORS.length]
            }));

            setChartData(data);
        } catch (err) {
            console.error('Failed to generate chart data:', err);
            setError('Failed to generate chart data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateChartData();
    }, [selectedYear, selectedMonth, selectedCurrency]);

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

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Box sx={{ 
                    bgcolor: 'white', 
                    border: '1px solid #ccc', 
                    p: 1, 
                    borderRadius: 1,
                    boxShadow: 2
                }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {data.name}
                    </Typography>
                    <Typography variant="body2">
                        {formatCurrency(data.value, selectedCurrency)}
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
                Monthly Costs by Category
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
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
                </Grid>

                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                        <InputLabel>Month</InputLabel>
                        <Select
                            value={selectedMonth}
                            label="Month"
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {months.map((month, index) => (
                                <MenuItem key={index + 1} value={index + 1}>
                                    {month}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
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
                </Grid>
            </Grid>

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
                        <RechartsPieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </Box>
            ) : (
                <Alert severity="info">
                    No data available for the selected month and year.
                </Alert>
            )}
        </Paper>
    );
};

export default PieChart;
