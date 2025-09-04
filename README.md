# Cost Manager Application

A comprehensive cost management web application built with React and IndexedDB for storing expense data locally in the browser.

## Features

- **Add Cost Items**: Add new expenses with sum, currency, category, and description
- **Monthly Reports**: Generate detailed reports for specific months and years
- **Pie Charts**: Visualize monthly costs by category
- **Bar Charts**: View yearly costs by month
- **Multi-Currency Support**: Support for USD, ILS, GBP, and EURO
- **Exchange Rate Integration**: Configurable URL for fetching real-time exchange rates
- **Local Storage**: All data stored locally using IndexedDB

## Technologies Used

- **Frontend**: React 18 with Vite
- **UI Components**: Material-UI (MUI)
- **Charts**: Recharts library
- **Database**: IndexedDB with custom wrapper library
- **Styling**: Emotion (CSS-in-JS)

## Project Structure

```
FrontendProject/
├── src/
│   ├── components/
│   │   ├── AddCostForm.jsx      # Form for adding new costs
│   │   ├── Reports.jsx          # Monthly cost reports
│   │   ├── PieChart.jsx         # Category-based pie chart
│   │   ├── BarChart.jsx         # Monthly bar chart
│   │   └── Settings.jsx         # Application settings
│   ├── services/
│   │   └── currencyService.js   # Currency exchange service
│   ├── App.jsx                  # Main application component
│   └── main.jsx                 # Application entry point
├── idb.js                       # IndexedDB wrapper library
├── test-idb.html               # Test file for idb.js library
├── index.html                  # Main HTML file
└── package.json                # Project dependencies
```

## Installation and Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FrontendProject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## Usage

### Adding Costs
1. Navigate to the "Add Cost" tab
2. Fill in the sum, select currency, category, and description
3. Click "Add Cost Item" to save

### Viewing Reports
1. Go to the "Reports" tab
2. Select year, month, and currency
3. View detailed cost breakdown

### Charts
- **Pie Chart**: Shows monthly costs by category
- **Bar Chart**: Displays yearly costs by month
- Both charts support currency selection

### Settings
1. Navigate to "Settings" tab
2. Enter exchange rate URL (JSON format)
3. Test connection and save configuration

## IndexedDB Library (idb.js)

The application includes a custom IndexedDB wrapper library with the following functions:

- `openCostsDB(databaseName, databaseVersion)`: Opens/creates database
- `addCost(cost)`: Adds new cost item
- `getReport(year, month, currency)`: Generates monthly report

### Testing the Library

Use the included `test-idb.html` file to test the IndexedDB library independently:

1. Open `test-idb.html` in a web browser
2. Check browser console for test results
3. Verify database operations work correctly

## Currency Support

Supported currencies:
- USD (US Dollar)
- ILS (Israeli Shekel)
- GBP (British Pound)
- EURO (Euro)

Exchange rates can be configured via a JSON endpoint returning data in the format:
```json
{
  "USD": 1,
  "GBP": 1.8,
  "EURO": 0.7,
  "ILS": 3.4
}
```

## Browser Compatibility

- Chrome (latest version)
- Firefox
- Safari
- Edge

## Deployment

The application can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure `idb.js` is accessible at the root path

## Development Notes

- All components use Material-UI for consistent styling
- IndexedDB operations are Promise-based
- Currency conversion happens automatically when generating reports
- Data is stored locally in the browser

## License

This project is created for educational purposes as part of a frontend development course.
