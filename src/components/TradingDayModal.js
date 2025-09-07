import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { DollarSign, X, BookOpen, Save } from "lucide-react";

const TradingDayModal = ({ isOpen, onClose, dayData, onSaveJournal }) => {
  const [journalEntry, setJournalEntry] = useState("");

  useEffect(() => {
    if (isOpen && dayData) {
      setJournalEntry(dayData.journal || "");
    }
  }, [isOpen, dayData]);

  if (!isOpen || !dayData) return null;

  const handleSave = () => {
    onSaveJournal(dayData.dateString, journalEntry);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <DollarSign size={24} style={{ color: "#3b82f6" }} />
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                margin: 0,
                color: "#1e293b",
              }}
            >
              {format(dayData.date, "MMMM d, yyyy")}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} style={{ color: "#6b7280" }} />
          </button>
        </div>

        {/* Trading Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Total P&L
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: dayData.isWin
                  ? "#16a34a"
                  : dayData.isLoss
                  ? "#dc2626"
                  : "#6b7280",
              }}
            >
              {dayData.totalPnL > 0 ? "+" : ""}${dayData.totalPnL.toFixed(2)}
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Total Trades
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1e293b",
              }}
            >
              {dayData.tradeCount || dayData.transactionCount}
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Wins
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#16a34a",
              }}
            >
              {dayData.winCount}
            </div>
          </div>

          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "4px",
                fontWeight: "500",
              }}
            >
              Losses
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#dc2626",
              }}
            >
              {dayData.lossCount}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              padding: "12px",
              backgroundColor: "#f1f5f9",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginBottom: "2px",
              }}
            >
              Total Value
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>
              ${dayData.totalValue?.toFixed(2) || "0.00"}
            </div>
          </div>

          <div
            style={{
              padding: "12px",
              backgroundColor: "#f1f5f9",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginBottom: "2px",
              }}
            >
              Total Fees
            </div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>
              ${dayData.totalFees?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>

        {/* Journal Section */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <BookOpen size={18} style={{ color: "#3b82f6" }} />
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                margin: 0,
                color: "#1e293b",
              }}
            >
              Trading Journal
            </h3>
          </div>

          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Write your thoughts about today's trading session..."
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d1d5db";
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#f9fafb";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "white";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#3b82f6",
                color: "white",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = "#2563eb";
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = "#3b82f6";
              }}
            >
              <Save size={14} />
              Save Journal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingDayModal;
