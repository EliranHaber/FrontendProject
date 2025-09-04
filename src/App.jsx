import React, { useState } from 'react';
import {
    Box,
    Container,
    AppBar,
    Toolbar,
    Typography,
    Tabs,
    Tab,
    CssBaseline,
    ThemeProvider,
    createTheme
} from '@mui/material';
import { AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import AddCostForm from './components/AddCostForm';
import Reports from './components/Reports';
import PieChart from './components/PieChart';
import BarChart from './components/BarChart';
import Settings from './components/Settings';

// Create a theme instance
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function App() {
    const [tabValue, setTabValue] = useState(0);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleCostAdded = () => {
        // Trigger refresh of reports and charts when a new cost is added
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <AccountBalanceIcon sx={{ mr: 2 }} />
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Cost Manager Application
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Container maxWidth="lg" sx={{ mt: 3 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={handleTabChange} 
                            aria-label="cost manager tabs"
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab label="Add Cost" />
                            <Tab label="Reports" />
                            <Tab label="Pie Chart" />
                            <Tab label="Bar Chart" />
                            <Tab label="Settings" />
                        </Tabs>
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <AddCostForm onCostAdded={handleCostAdded} />
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Reports key={refreshTrigger} />
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <PieChart key={refreshTrigger} />
                    </TabPanel>

                    <TabPanel value={tabValue} index={3}>
                        <BarChart key={refreshTrigger} />
                    </TabPanel>

                    <TabPanel value={tabValue} index={4}>
                        <Settings />
                    </TabPanel>
                </Container>
            </Box>
        </ThemeProvider>
    );
}

export default App;
