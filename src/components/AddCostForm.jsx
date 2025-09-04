import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Paper,
    Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import currencyService from '../services/currencyService';

const AddCostForm = ({ onCostAdded }) => {
    const [formData, setFormData] = useState({
        sum: '',
        currency: 'USD',
        category: '',
        description: ''
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Predefined categories for cost items
    const categories = [
        'Food',
        'Transportation',
        'Entertainment',
        'Shopping',
        'Bills',
        'Healthcare',
        'Education',
        'Travel',
        'Other'
    ];

    const currencies = currencyService.getSupportedCurrencies();

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.sum || formData.sum <= 0) {
            newErrors.sum = 'Sum must be a positive number';
        }
        
        if (!formData.category.trim()) {
            newErrors.category = 'Category is required';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            // Use the global db object from idb.js
            const costItem = await window.db.addCost({
                sum: parseFloat(formData.sum),
                currency: formData.currency,
                category: formData.category,
                description: formData.description
            });
            
            setSuccessMessage('Cost item added successfully!');
            
            // Reset form
            setFormData({
                sum: '',
                currency: 'USD',
                category: '',
                description: ''
            });
            
            // Notify parent component
            if (onCostAdded) {
                onCostAdded(costItem);
            }
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
            
        } catch (error) {
            console.error('Failed to add cost item:', error);
            setErrors({ submit: 'Failed to add cost item. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Add New Cost Item
            </Typography>
            
            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {successMessage}
                </Alert>
            )}
            
            {errors.submit && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.submit}
                </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                    <TextField
                        label="Sum"
                        type="number"
                        value={formData.sum}
                        onChange={(e) => handleInputChange('sum', e.target.value)}
                        error={!!errors.sum}
                        helperText={errors.sum}
                        required
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                    />
                    
                    <FormControl fullWidth required error={!!errors.currency}>
                        <InputLabel>Currency</InputLabel>
                        <Select
                            value={formData.currency}
                            label="Currency"
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                        >
                            {currencies.map(currency => (
                                <MenuItem key={currency} value={currency}>
                                    {currency}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <FormControl fullWidth required error={!!errors.category}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={formData.category}
                            label="Category"
                            onChange={(e) => handleInputChange('category', e.target.value)}
                        >
                            {categories.map(category => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <TextField
                        label="Description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        error={!!errors.description}
                        helperText={errors.description}
                        required
                        fullWidth
                        multiline
                        rows={2}
                    />
                </Box>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<AddIcon />}
                        disabled={isSubmitting}
                        size="large"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Cost Item'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default AddCostForm;
