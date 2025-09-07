import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { getPerformanceStats } from "../utils/dataProcessor";

const PerformanceStats = ({ dailyData }) => {
  const stats = getPerformanceStats(dailyData);

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        border: "1px solid #f3f4f6",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          backgroundColor: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={24} color={color} />
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            fontWeight: "500",
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "2px",
          }}
        >
          {value}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );

  if (!dailyData || dailyData.length === 0) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          title="Total Trades"
          value="0"
          icon={BarChart3}
          color="#6b7280"
        />
        <StatCard
          title="Total P&L"
          value="$0.00"
          icon={DollarSign}
          color="#6b7280"
        />
        <StatCard title="Win Rate" value="0%" icon={Target} color="#6b7280" />
        <StatCard
          title="Avg Daily P&L"
          value="$0.00"
          icon={TrendingUp}
          color="#6b7280"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}
    >
      <StatCard
        title="Total Trades"
        value={stats.totalTrades.toLocaleString()}
        icon={BarChart3}
        color="#3b82f6"
        subtitle={`Across ${dailyData.length} trading days`}
      />

      <StatCard
        title="Total P&L"
        value={`${stats.totalPnL >= 0 ? "+" : ""}$${stats.totalPnL.toFixed(2)}`}
        icon={DollarSign}
        color={stats.totalPnL >= 0 ? "#16a34a" : "#dc2626"}
        subtitle={stats.totalPnL >= 0 ? "Profitable" : "Loss"}
      />

      <StatCard
        title="Win Rate"
        value={`${stats.winRate.toFixed(1)}%`}
        icon={Target}
        color={stats.winRate >= 50 ? "#16a34a" : "#dc2626"}
        subtitle={`${Math.round(
          (stats.winRate / 100) * dailyData.length
        )} winning days`}
      />

      <StatCard
        title="Avg Daily P&L"
        value={`${
          stats.avgDailyPnL >= 0 ? "+" : ""
        }$${stats.avgDailyPnL.toFixed(2)}`}
        icon={stats.avgDailyPnL >= 0 ? TrendingUp : TrendingDown}
        color={stats.avgDailyPnL >= 0 ? "#16a34a" : "#dc2626"}
        subtitle="Per trading day"
      />

      {stats.bestDay && (
        <StatCard
          title="Best Day"
          value={`+$${stats.bestDay.totalPnL.toFixed(2)}`}
          icon={TrendingUp}
          color="#16a34a"
          subtitle={new Date(stats.bestDay.date).toLocaleDateString()}
        />
      )}

      {stats.worstDay && (
        <StatCard
          title="Worst Day"
          value={`$${stats.worstDay.totalPnL.toFixed(2)}`}
          icon={TrendingDown}
          color="#dc2626"
          subtitle={new Date(stats.worstDay.date).toLocaleDateString()}
        />
      )}
    </div>
  );
};

export default PerformanceStats;
