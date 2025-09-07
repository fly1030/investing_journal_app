import React, { useState, useCallback, useEffect } from "react";
import FileUpload from "./components/FileUpload";
import Dashboard from "./components/Dashboard";
import Auth from "./components/Auth";
import UserProfile from "./components/UserProfile";
import { processTradeData } from "./utils/dataProcessor";
import { onAuthStateChange } from "./firebase/auth";
import { saveTradingData, loadTradingData } from "./firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [tradeData, setTradeData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [currentAccountId, setCurrentAccountId] = useState(null);
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);

  // Load user's saved data when they sign in
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // First, load accounts
      const accountsResult = await loadTradingData(user.uid, "accounts");
      if (accountsResult.success && accountsResult.data?.accounts) {
        setAccounts(accountsResult.data.accounts);
        // Auto-select the first account
        if (accountsResult.data.accounts.length > 0) {
          const firstAccountId = accountsResult.data.accounts[0].id;
          setCurrentAccountId(firstAccountId);
          setSelectedAccountIds([firstAccountId]);
          await loadAccountData(firstAccountId);
        }
      } else {
        // No accounts found, create a default one
        const defaultAccount = {
          id: Date.now().toString(),
          name: "Main Account",
          createdAt: new Date().toISOString(),
        };
        setAccounts([defaultAccount]);
        setCurrentAccountId(defaultAccount.id);
        setSelectedAccountIds([defaultAccount.id]);
        await saveTradingData(
          user.uid,
          { accounts: [defaultAccount] },
          "accounts"
        );
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = useCallback(
    async (file, uploadMode = "replace", targetAccountId = null) => {
      const accountId = targetAccountId || currentAccountId;
      if (!user || !accountId) {
        setError("Please sign in and select an account to upload files");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Process the file (this filters out cancelled trades and processes the data)
        const processedData = await processTradeData(file);

        let finalTrades = processedData.trades;
        let finalDailyData = processedData.dailyData;

        // If appending mode and we have existing data, merge the data
        if (uploadMode === "append" && tradeData && tradeData.length > 0) {
          // Merge trades and remove duplicates
          const mergedTrades = mergeTrades(tradeData, processedData.trades);
          finalTrades = mergedTrades;

          // Recalculate daily data with merged trades
          const { calculateDailyPerformance } = await import(
            "./utils/dataProcessor"
          );
          finalDailyData = calculateDailyPerformance(mergedTrades);
        }

        // Only update current state if this is for the current account
        if (accountId === currentAccountId) {
          setTradeData(finalTrades);
          setDailyData(finalDailyData);
        }

        // Clean the data before saving to avoid invalid Date objects
        const cleanDailyData = finalDailyData.map((day) => {
          const cleanDay = { ...day };
          // Remove the date object and keep only dateString for Firestore
          delete cleanDay.date;
          return cleanDay;
        });

        const cleanTrades = finalTrades?.map((trade) => {
          const cleanTrade = { ...trade };
          // Convert Date to string for Firestore
          if (cleanTrade.Date instanceof Date) {
            cleanTrade.Date = cleanTrade.Date.toISOString();
          }
          return cleanTrade;
        });

        // Save only the processed trading data to Firestore (no file storage needed)
        await saveTradingData(
          user.uid,
          {
            trades: cleanTrades,
            dailyData: cleanDailyData,
            fileName: file.name, // Just store the filename for reference
            uploadedAt: new Date().toISOString(),
            uploadMode: uploadMode,
          },
          accountId
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user, currentAccountId, tradeData]
  );

  const handleReset = useCallback(() => {
    setTradeData(null);
    setDailyData(null);
    setError(null);
  }, []);

  // Function to merge trades and remove duplicates
  const mergeTrades = useCallback((existingTrades, newTrades) => {
    // Create a map to track unique trades based on key properties
    const tradeMap = new Map();

    // Add existing trades to the map
    existingTrades.forEach((trade) => {
      const key = `${trade.Date?.getTime()}_${trade.Symbol}_${trade.Quantity}_${
        trade.Price
      }_${trade.Type}`;
      tradeMap.set(key, trade);
    });

    // Add new trades, skipping duplicates
    newTrades.forEach((trade) => {
      const key = `${trade.Date?.getTime()}_${trade.Symbol}_${trade.Quantity}_${
        trade.Price
      }_${trade.Type}`;
      if (!tradeMap.has(key)) {
        tradeMap.set(key, trade);
      }
    });

    // Convert back to array and sort by date
    const mergedTrades = Array.from(tradeMap.values()).sort((a, b) => {
      return new Date(a.Date) - new Date(b.Date);
    });

    return mergedTrades;
  }, []);

  const handleSaveJournal = useCallback(
    async (dateString, journalEntry) => {
      if (!user || !currentAccountId) return;

      try {
        console.log(
          "Saving journal for date:",
          dateString,
          "entry:",
          journalEntry
        );

        // Update the daily data with the journal entry
        let updatedDailyData;
        const existingDayIndex = dailyData.findIndex(day => day.dateString === dateString);
        
        if (existingDayIndex >= 0) {
          // Update existing day data
          updatedDailyData = dailyData.map((day) =>
            day.dateString === dateString
              ? { ...day, journal: journalEntry }
              : day
          );
        } else {
          // Create new day data for journal-only entries
          const [year, month, dayNum] = dateString.split("-");
          const newDayData = {
            date: new Date(parseInt(year), parseInt(month) - 1, parseInt(dayNum)),
            dateString: dateString,
            totalPnL: 0,
            totalCommission: 0,
            totalClearingFee: 0,
            totalExchangeFee: 0,
            totalFees: 0,
            totalValue: 0,
            tradeCount: 0,
            transactionCount: 0,
            winCount: 0,
            lossCount: 0,
            neutralCount: 0,
            isWin: false,
            isLoss: false,
            isNeutral: true,
            performance: 0,
            journal: journalEntry
          };
          updatedDailyData = [...dailyData, newDayData];
        }

        setDailyData(updatedDailyData);

        // Clean the data before saving to avoid invalid Date objects
        const cleanDailyData = updatedDailyData.map((day) => {
          const cleanDay = { ...day };
          // Remove the date object and keep only dateString for Firestore
          delete cleanDay.date;
          return cleanDay;
        });

        const cleanTrades = tradeData?.map((trade) => {
          const cleanTrade = { ...trade };
          // Convert Date to string for Firestore
          if (cleanTrade.Date instanceof Date) {
            cleanTrade.Date = cleanTrade.Date.toISOString();
          }
          return cleanTrade;
        });

        // Save to Firestore with account-specific path
        const saveResult = await saveTradingData(
          user.uid,
          {
            trades: cleanTrades,
            dailyData: cleanDailyData,
            fileName: "Updated with journal",
            uploadedAt: new Date().toISOString(),
          },
          currentAccountId
        );
      } catch (error) {
        console.error("Error saving journal:", error);
      }
    },
    [user, dailyData, tradeData, currentAccountId]
  );

  // Account management functions
  const handleCreateAccount = useCallback(
    async (accountName) => {
      if (!user) return;

      const newAccount = {
        id: Date.now().toString(),
        name: accountName,
        createdAt: new Date().toISOString(),
      };

      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      setCurrentAccountId(newAccount.id);
      setSelectedAccountIds([newAccount.id]);

      // Save accounts to Firestore
      await saveTradingData(
        user.uid,
        { accounts: updatedAccounts },
        "accounts"
      );
    },
    [user, accounts]
  );

  const loadAccountData = useCallback(
    async (accountId) => {
      if (!user || !accountId) return;

      setLoading(true);
      try {
        const result = await loadTradingData(user.uid, accountId);
        if (result.success && result.data) {
          // Convert date strings back to Date objects for daily data
          const processedDailyData = result.data.dailyData?.map((day) => {
            let date;
            if (day.dateString) {
              // Parse the date string and create a date in local timezone
              const [year, month, dayNum] = day.dateString.split("-");
              date = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(dayNum)
              );
              // Validate the date
              if (isNaN(date.getTime())) {
                console.warn(
                  "Invalid date for day:",
                  day.dateString,
                  "using current date"
                );
                date = new Date();
              }
            } else {
              date = new Date();
            }
            return {
              ...day,
              date: date,
            };
          });

          // Convert date strings back to Date objects for trades
          const processedTrades = result.data.trades?.map((trade) => {
            let tradeDate;
            if (trade.Date instanceof Date) {
              tradeDate = trade.Date;
            } else if (trade.Date) {
              tradeDate = new Date(trade.Date);
              // Validate the date
              if (isNaN(tradeDate.getTime())) {
                console.warn(
                  "Invalid trade date:",
                  trade.Date,
                  "using current date"
                );
                tradeDate = new Date();
              }
            } else {
              tradeDate = new Date();
            }

            return {
              ...trade,
              Date: tradeDate,
            };
          });

          setTradeData(processedTrades || null);
          setDailyData(processedDailyData || null);
        } else {
          setTradeData(null);
          setDailyData(null);
        }
      } catch (err) {
        console.error("Error loading account data:", err);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const handleSelectAccounts = useCallback(
    (accountIds) => {
      setSelectedAccountIds(accountIds);

      // If no accounts selected, clear the data
      if (accountIds.length === 0) {
        setTradeData(null);
        setDailyData(null);
        setCurrentAccountId(null);
      } else {
        // Set the first selected account as current
        setCurrentAccountId(accountIds[0]);
        // Load data for the first selected account
        loadAccountData(accountIds[0]);
      }
    },
    [loadAccountData]
  );

  const handleUploadToAccount = useCallback(
    (accountId) => {
      // Trigger file upload dialog for specific account
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".csv,.xlsx,.xls";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          handleFileUpload(file, "replace", accountId);
        }
      };
      input.click();
    },
    [handleFileUpload]
  );

  const handleUpdateAccount = useCallback(
    async (accountId, newName) => {
      const updatedAccounts = accounts.map((account) =>
        account.id === accountId ? { ...account, name: newName } : account
      );
      setAccounts(updatedAccounts);
      await saveTradingData(
        user.uid,
        { accounts: updatedAccounts },
        "accounts"
      );
    },
    [user, accounts]
  );

  const handleDeleteAccount = useCallback(
    async (accountId) => {
      const updatedAccounts = accounts.filter(
        (account) => account.id !== accountId
      );
      setAccounts(updatedAccounts);

      if (currentAccountId === accountId) {
        const newCurrentAccount = updatedAccounts[0];
        setCurrentAccountId(newCurrentAccount?.id || null);
        setSelectedAccountIds(newCurrentAccount ? [newCurrentAccount.id] : []);
        if (newCurrentAccount) {
          await loadAccountData(newCurrentAccount.id);
        } else {
          setTradeData(null);
          setDailyData(null);
        }
      } else {
        // Update selected accounts to remove the deleted one
        setSelectedAccountIds(
          selectedAccountIds.filter((id) => id !== accountId)
        );
      }

      await saveTradingData(
        user.uid,
        { accounts: updatedAccounts },
        "accounts"
      );
    },
    [user, accounts, currentAccountId, selectedAccountIds]
  );

  const handleAuthSuccess = useCallback((user) => {
    setUser(user);
  }, []);

  const handleSignOut = useCallback(() => {
    setUser(null);
    setTradeData(null);
    setDailyData(null);
    setError(null);
  }, []);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  // Show loading screen while checking authentication
  if (initializing) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#6b7280" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication if user is not signed in
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="container">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
          padding: "16px 0",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "#1e293b",
              marginBottom: "8px",
            }}
          >
            Investment Journal
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#64748b" }}>
            Track your trades and analyze your performance
          </p>
        </div>
        <UserProfile user={user} onSignOut={handleSignOut} />
      </header>

      {!tradeData || selectedAccountIds.length === 0 ? (
        <FileUpload
          onFileUpload={handleFileUpload}
          loading={loading}
          error={error}
          hasExistingData={tradeData && tradeData.length > 0}
        />
      ) : (
        <Dashboard
          tradeData={tradeData}
          dailyData={dailyData}
          onReset={handleReset}
          onSaveJournal={handleSaveJournal}
          accounts={accounts}
          selectedAccountIds={selectedAccountIds}
          onSelectAccounts={handleSelectAccounts}
          onCreateAccount={handleCreateAccount}
          onUpdateAccount={handleUpdateAccount}
          onDeleteAccount={handleDeleteAccount}
          onUploadToAccount={handleUploadToAccount}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
