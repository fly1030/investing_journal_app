# Investment Journal App

A React-based web application for tracking and analyzing your trading performance. Upload your trade data from Excel files and visualize your performance through interactive calendars and charts.

## Features

- **Excel File Upload**: Upload your trade data from .xlsx or .xls files
- **Interactive Calendar**: View daily win/loss indicators on a calendar
- **Performance Charts**: Multiple chart types showing cumulative P&L, daily P&L, and performance percentages
- **Performance Statistics**: Key metrics including win rate, total P&L, and best/worst days
- **Recent Trades Table**: View your most recent trades in a detailed table
- **Data Export**: Export your performance data as CSV

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Navigate to the project directory:

   ```bash
   cd investing_journal_app
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Open your browser and go to `http://localhost:3000`

## Excel File Format

Your Excel file should contain the following columns:

| Column   | Description                                            | Example    |
| -------- | ------------------------------------------------------ | ---------- |
| Date     | Trade date                                             | 2024-01-15 |
| Symbol   | Stock symbol                                           | AAPL       |
| Quantity | Number of shares (positive for buy, negative for sell) | 100 or -50 |
| Price    | Price per share                                        | 150.25     |
| PnL      | Profit/Loss for the trade (optional)                   | 250.50     |

### Sample Data

A sample Excel file (`sample_trades.xlsx`) is included in the project for testing purposes.

## Usage

1. **Upload Data**: Click "Upload Your Trade Data" and select your Excel file
2. **View Calendar**: The calendar shows daily performance with color-coded indicators:
   - Green: Profitable day
   - Red: Loss day
   - Gray: Neutral/break-even day
3. **Analyze Charts**: Switch between different chart views:
   - Cumulative P&L: Total profit/loss over time
   - Daily P&L: Daily profit/loss amounts
   - Performance %: Performance as percentage of trade value
4. **Review Stats**: Check key performance metrics in the stats cards
5. **Export Data**: Download your performance data as CSV

## Components

- **FileUpload**: Handles Excel file upload with drag-and-drop support
- **Dashboard**: Main dashboard combining all components
- **TradingCalendar**: Interactive calendar with win/loss indicators
- **PerformanceChart**: Line/area charts for performance visualization
- **PerformanceStats**: Key performance metrics cards

## Technologies Used

- React 18
- Recharts for data visualization
- React Calendar for calendar component
- XLSX for Excel file parsing
- Lucide React for icons
- CSS for styling

## Browser Support

This app works in all modern browsers including Chrome, Firefox, Safari, and Edge.

## License

This project is open source and available under the MIT License.
