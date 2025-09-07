import React, { useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import TradingDayModal from "./TradingDayModal";
import "react-calendar/dist/Calendar.css";

const TradingCalendar = ({ dailyData, onSaveJournal }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create a map of dates to daily data for quick lookup
  const dailyDataMap = {};
  dailyData?.forEach((day) => {
    try {
      const dateKey = format(day.date, "yyyy-MM-dd");
      dailyDataMap[dateKey] = day;
    } catch (error) {
      console.error("Error creating date key for day:", day, error);
    }
  });

  const getDayContent = (date) => {
    try {
      // Extract the actual date from the react-calendar object
      let dateObj;
      if (date && date.date) {
        // react-calendar passes an object with a 'date' property
        dateObj = date.date;
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        dateObj = new Date(date);
      }

      // Validate the date
      if (!dateObj || isNaN(dateObj.getTime())) {
        return null;
      }

      const dateString = format(dateObj, "yyyy-MM-dd");
      const dayData = dailyDataMap[dateString];

      if (!dayData) {
        return null;
      }

      const {
        totalPnL,
        tradeCount,
        transactionCount,
        isWin,
        isLoss,
        isNeutral,
      } = dayData;

      // Use transactionCount if tradeCount is not available
      const actualTradeCount = tradeCount || transactionCount || 0;

      return (
        <div style={{ position: "relative", height: "100%", width: "100%" }}>
          {/* Journal indicator pill - positioned at top right of the entire tile */}
          {dayData.journal && dayData.journal.trim() !== "" && (
            <div
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                backgroundColor: "#3b82f6",
                color: "white",
                fontSize: "9px",
                fontWeight: "600",
                padding: "2px 6px",
                borderRadius: "8px",
                minWidth: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                zIndex: 10,
              }}
              title="Has journal entry"
            >
              J
            </div>
          )}

          {/* P&L and trade count data at bottom */}
          <div
            style={{
              padding: "2px",
              fontSize: "14px",
              textAlign: "center",
              position: "absolute",
              bottom: "4px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                color: isWin ? "#16a34a" : isLoss ? "#dc2626" : "#6b7280",
                fontSize: "15px",
              }}
            >
              {totalPnL > 0 ? "+" : ""}${totalPnL.toFixed(0)}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#6b7280",
                marginTop: "1px",
              }}
            >
              {actualTradeCount} trade{actualTradeCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Date formatting error:", error, date);
      return null;
    }
  };

  return (
    <div className="card">
      <div style={{ marginBottom: "20px" }}>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          Trading Calendar
        </h3>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          Click on any date to see detailed trading information
        </p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <Calendar
          value={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            const dateString = format(date, "yyyy-MM-dd");
            const dayData = dailyDataMap[dateString];
            if (dayData) {
              setIsModalOpen(true);
            }
          }}
          tileContent={getDayContent}
          calendarType="US"
          formatShortWeekday={(locale, date) => format(date, "EEE")}
          tileClassName={({ date }) => {
            const dateString = format(date, "yyyy-MM-dd");
            const dayData = dailyDataMap[dateString];
            if (!dayData) return "";

            if (dayData.isWin) return "trading-day-win";
            if (dayData.isLoss) return "trading-day-loss";
            if (dayData.isNeutral) return "trading-day-neutral";
            return "";
          }}
        />
      </div>

      <TradingDayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        dayData={
          selectedDate ? dailyDataMap[format(selectedDate, "yyyy-MM-dd")] : null
        }
        onSaveJournal={onSaveJournal}
      />

      <style jsx global>{`
        .react-calendar {
          width: 100%;
          border: none;
          border-radius: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .react-calendar__navigation {
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 8px 8px 0 0;
        }

        .react-calendar__navigation button {
          color: #374151;
          font-weight: 500;
        }

        .react-calendar__navigation button:hover {
          background: #e5e7eb;
        }

        .react-calendar__month-view__weekdays {
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
        }

        .react-calendar__month-view__weekdays__weekday {
          color: #6b7280;
          font-weight: 500;
          padding: 8px 0;
        }

        .react-calendar__tile {
          border: 1px solid #f3f4f6;
          background: white;
          padding: 2px;
          min-height: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          position: relative;
        }

        .react-calendar__tile:hover {
          background: #f8fafc;
        }

        .react-calendar__tile--active {
          background: #dbeafe !important;
          color: #1d4ed8;
        }

        .react-calendar__tile--now {
          background: #fef3c7;
        }

        .trading-day-win {
          background: #f0fdf4 !important;
          border-color: #bbf7d0 !important;
        }

        .trading-day-loss {
          background: #fef2f2 !important;
          border-color: #fecaca !important;
        }

        .trading-day-neutral {
          background: #f9fafb !important;
          border-color: #d1d5db !important;
        }

        .trading-day-win:hover,
        .trading-day-loss:hover,
        .trading-day-neutral:hover {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
};

export default TradingCalendar;
