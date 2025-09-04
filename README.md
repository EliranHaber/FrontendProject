# Cost Manager (React + IndexedDB)

Simple expense tracker with charts and multi‑currency reports.

## Quick Start

```bash
npm install
npm run dev
# open http://localhost:5173
```

## Core Features

- Add costs: sum, currency, category, description
- Monthly reports (by year/month)
- Pie and Bar charts with currency selection (USD, ILS, GBP, EURO)
- Exchange rates fetched from a URL you configure
- Data stored locally via IndexedDB

## Exchange Rates

- Provide a JSON at a URL with this shape:
```json
{ "USD": 1, "GBP": 1.8, "EURO": 0.7, "ILS": 3.4 }
```
- Example (if deployed as a static file):
`https://YOUR-RENDER-DOMAIN/sample-exchange-rates.json`
- The app/`idb.js` loads rates and uses them for reports/charts.

## Testing the IndexedDB Library

- Open `test-idb.html` in a browser to try `idb.js` directly.

## Structure

```
src/
  components/ (AddCostForm, Reports, PieChart, BarChart, Settings)
  services/currencyService.js
public/
  idb.js
  sample-exchange-rates.json
```

## Build & Deploy

```bash
npm run build
# deploy the dist/ folder
```
