import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

const PerformanceChart = ({ dailyData }) => {
  const [chartType, setChartType] = useState("cumulative"); // 'cumulative', 'daily', 'performance'

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: "center", padding: "40px" }}>
          <BarChart3 size={48} color="#9ca3af" />
          <p style={{ marginTop: "16px", color: "#6b7280" }}>
            No performance data available
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = dailyData.map((day) => ({
    date: day.dateString,
    displayDate: new Date(day.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    dailyPnL: day.totalPnL,
    cumulativePnL: day.cumulativePnL,
    performance: day.performance,
    tradeCount: day.tradeCount,
    winCount: day.winCount,
    lossCount: day.lossCount,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <p style={{ fontWeight: "600", marginBottom: "8px" }}>
            {new Date(data.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {chartType === "cumulative" && (
            <div>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Cumulative P&L:{" "}
                <span
                  style={{
                    color: data.cumulativePnL >= 0 ? "#16a34a" : "#dc2626",
                    fontWeight: "600",
                  }}
                >
                  {data.cumulativePnL >= 0 ? "+" : ""}$
                  {data.cumulativePnL.toFixed(2)}
                </span>
              </p>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Daily P&L:{" "}
                <span
                  style={{
                    color: data.dailyPnL >= 0 ? "#16a34a" : "#dc2626",
                    fontWeight: "600",
                  }}
                >
                  {data.dailyPnL >= 0 ? "+" : ""}${data.dailyPnL.toFixed(2)}
                </span>
              </p>
            </div>
          )}

          {chartType === "daily" && (
            <div>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Daily P&L:{" "}
                <span
                  style={{
                    color: data.dailyPnL >= 0 ? "#16a34a" : "#dc2626",
                    fontWeight: "600",
                  }}
                >
                  {data.dailyPnL >= 0 ? "+" : ""}${data.dailyPnL.toFixed(2)}
                </span>
              </p>
            </div>
          )}

          {chartType === "performance" && (
            <div>
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Performance:{" "}
                <span
                  style={{
                    color: data.performance >= 0 ? "#16a34a" : "#dc2626",
                    fontWeight: "600",
                  }}
                >
                  {data.performance >= 0 ? "+" : ""}
                  {data.performance.toFixed(2)}%
                </span>
              </p>
            </div>
          )}

          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>
            Trades: {data.tradeCount} | Wins: {data.winCount} | Losses:{" "}
            {data.lossCount}
          </p>
        </div>
      );
    }
    return null;
  };

  const getChartConfig = () => {
    switch (chartType) {
      case "cumulative":
        return {
          dataKey: "cumulativePnL",
          color: "#3b82f6",
          name: "Cumulative P&L",
          format: (value) => `$${value.toFixed(2)}`,
        };
      case "daily":
        return {
          dataKey: "dailyPnL",
          color: "#10b981",
          name: "Daily P&L",
          format: (value) => `$${value.toFixed(2)}`,
        };
      case "performance":
        return {
          dataKey: "performance",
          color: "#8b5cf6",
          name: "Performance %",
          format: (value) => `${value.toFixed(2)}%`,
        };
      default:
        return {
          dataKey: "cumulativePnL",
          color: "#3b82f6",
          name: "Cumulative P&L",
          format: (value) => `$${value.toFixed(2)}`,
        };
    }
  };

  const chartConfig = getChartConfig();

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "4px",
            }}
          >
            Performance Chart
          </h3>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Track your trading performance over time
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setChartType("cumulative")}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: chartType === "cumulative" ? "#3b82f6" : "white",
              color: chartType === "cumulative" ? "white" : "#374151",
              fontSize: "12px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Cumulative
          </button>
          <button
            onClick={() => setChartType("daily")}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: chartType === "daily" ? "#3b82f6" : "white",
              color: chartType === "daily" ? "white" : "#374151",
              fontSize: "12px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Daily
          </button>
          <button
            onClick={() => setChartType("performance")}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor:
                chartType === "performance" ? "#3b82f6" : "white",
              color: chartType === "performance" ? "white" : "#374151",
              fontSize: "12px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Performance %
          </button>
        </div>
      </div>

      <div style={{ height: "400px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "performance" ? (
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="displayDate"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={chartConfig.dataKey}
                stroke={chartConfig.color}
                fill={chartConfig.color}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="displayDate"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={chartConfig.dataKey}
                stroke={chartConfig.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chartConfig.color, strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: "#f8fafc",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <TrendingUp size={16} color="#6b7280" />
        <span style={{ fontSize: "14px", color: "#6b7280" }}>
          {chartType === "cumulative" &&
            "Shows your total profit/loss over time"}
          {chartType === "daily" &&
            "Shows daily profit/loss for each trading day"}
          {chartType === "performance" &&
            "Shows performance percentage based on trade values"}
        </span>
      </div>
    </div>
  );
};

export default PerformanceChart;
