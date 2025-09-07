import React from "react";
import TradingCalendar from "./TradingCalendar";
import PerformanceChart from "./PerformanceChart";
import PerformanceStats from "./PerformanceStats";
import AccountSelector from "./AccountSelector";
import { RotateCcw, Download } from "lucide-react";

const Dashboard = ({
  tradeData,
  dailyData,
  onReset,
  onSaveJournal,
  accounts,
  selectedAccountIds,
  onSelectAccounts,
  onCreateAccount,
  onUpdateAccount,
  onDeleteAccount,
  onUploadToAccount,
}) => {
  const handleExportData = () => {
    // Create CSV data
    const csvData = dailyData.map((day) => ({
      Date: day.dateString,
      "Daily P&L": day.totalPnL,
      "Cumulative P&L": day.cumulativePnL,
      "Trade Count": day.tradeCount,
      Wins: day.winCount,
      Losses: day.lossCount,
      "Performance %": day.performance,
    }));

    // Convert to CSV
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => headers.map((header) => row[header]).join(",")),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trading-performance-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header with actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          padding: "16px",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "4px",
            }}
          >
            Trading Dashboard
          </h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            {tradeData?.length || 0} trades across {dailyData?.length || 0}{" "}
            trading days
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Account Selector */}
          <AccountSelector
            accounts={accounts}
            selectedAccountIds={selectedAccountIds}
            onSelectAccounts={onSelectAccounts}
            onCreateAccount={onCreateAccount}
            onUpdateAccount={onUpdateAccount}
            onDeleteAccount={onDeleteAccount}
            onUploadToAccount={onUploadToAccount}
            hasExistingData={tradeData && tradeData.length > 0}
          />
          <button
            onClick={handleExportData}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              color: "#374151",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Download size={16} />
            Export Data
          </button>

          <button
            onClick={onReset}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#dc2626",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <RotateCcw size={16} />
            Upload New Data
          </button>
        </div>
      </div>

      {/* Performance Stats */}
      <PerformanceStats dailyData={dailyData} />

      {/* Main Content Grid */}
      <div className="grid grid-2">
        <TradingCalendar dailyData={dailyData} onSaveJournal={onSaveJournal} />
        <PerformanceChart dailyData={dailyData} />
      </div>

      {/* Recent Trades Table */}
      <div className="card">
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "16px",
          }}
        >
          Recent Trades
        </h3>

        {tradeData && tradeData.length > 0 ? (
          <div
            style={{
              overflowX: "auto",
              maxHeight: "400px",
              overflowY: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Symbol
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Quantity
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Price
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    Value
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      textAlign: "right",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    P&L
                  </th>
                </tr>
              </thead>
              <tbody>
                {tradeData
                  .sort((a, b) => new Date(b.Date) - new Date(a.Date))
                  .map((trade, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        backgroundColor: index % 2 === 0 ? "white" : "#f9fafb",
                      }}
                    >
                      <td style={{ padding: "12px", color: "#6b7280" }}>
                        {new Date(trade.Date).toLocaleDateString()}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        {trade.Symbol}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          color: trade.Quantity > 0 ? "#16a34a" : "#dc2626",
                          fontWeight: "500",
                        }}
                      >
                        {trade.Quantity > 0 ? "+" : ""}
                        {trade.Quantity}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          color: "#374151",
                        }}
                      >
                        ${trade.Price.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          color: "#374151",
                        }}
                      >
                        ${Math.abs(trade.Value).toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          color:
                            trade.PnL > 0
                              ? "#16a34a"
                              : trade.PnL < 0
                              ? "#dc2626"
                              : "#6b7280",
                          fontWeight: "500",
                        }}
                      >
                        {trade.PnL > 0 ? "+" : ""}${trade.PnL.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#6b7280",
            }}
          >
            No trade data available
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
