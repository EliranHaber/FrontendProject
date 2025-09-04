import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Grid
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import currencyService from '../services/currencyService';

const Reports = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const currencies = currencyService.getSupportedCurrencies();
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate years (current year - 5 to current year + 1)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

    const generateReport = async () => {
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
            setReport(reportData);
        } catch (err) {
            console.error('Failed to generate report:', err);
            setError('Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateReport();
    }, [selectedYear, selectedMonth, selectedCurrency]);

    const formatCurrency = (amount, currency) => {
        try {
            const iso = currencyService.toIsoCurrencyCode(currency);
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: iso
            }).format(amount || 0);
        } catch (e) {
            // Fallback formatting
            return `${currency} ${Number(amount || 0).toFixed(2)}`;
        }
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
                Monthly Cost Report
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={3}>
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

                <Grid item xs={12} sm={3}>
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

                <Grid item xs={12} sm={3}>
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

                <Grid item xs={12} sm={3}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={generateReport}
                        disabled={loading}
                        fullWidth
                    >
                        Refresh
                    </Button>
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
            ) : report ? (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Report for {months[selectedMonth - 1]} {selectedYear}
                    </Typography>

                    {report.costs.length === 0 ? (
                        <Alert severity="info">
                            No costs found for the selected month and year.
                        </Alert>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell align="right">Amount ({selectedCurrency})</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {report.costs.map((cost, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{cost.Date.day}</TableCell>
                                                <TableCell>{cost.category}</TableCell>
                                                <TableCell>{cost.description}</TableCell>
                                                <TableCell align="right">
                                                    {formatCurrency(cost.convertedSum ?? cost.sum, selectedCurrency)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                <Typography variant="h6" align="right">
                                    Total: {formatCurrency(report.total.total, selectedCurrency)}
                                </Typography>
                            </Box>
                        </>
                    )}
                </Box>
            ) : null}
        </Paper>
    );
};

export default Reports;
