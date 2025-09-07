import { parseFile, validateTradeData } from "./excelParser";
import { format, parseISO, startOfDay } from "date-fns";
import { getContractSpecs, priceDifferenceToDollars } from "./contractSpecs";

export const processTradeData = async (file) => {
  try {
    console.log(
      `Processing file: ${file.name} (${(file.size / 1024 / 1024).toFixed(
        2
      )} MB)`
    );

    // Parse file (CSV or Excel)
    const { trades: rawTrades } = await parseFile(file);
    console.log(`Parsed ${rawTrades.length} trades`);

    // Validate data
    const validationErrors = validateTradeData(rawTrades);
    if (validationErrors.length > 0) {
      throw new Error(
        `Data validation failed:\n${validationErrors.join("\n")}`
      );
    }

    // Process trades with performance optimization
    console.log("Processing trades...");

    // Note: Canceled orders are already filtered out during parsing
    console.log(
      `Processing ${rawTrades.length} trades (canceled orders already filtered out)`
    );

    const processedTrades = rawTrades.map((trade) => {
      // Get quantity from either filledQty or Filled Qty column
      const quantity = Number(trade.filledQty || trade["Filled Qty"] || 0);

      // Get price from either avgPrice or Avg Fill Price column
      const price = Number(trade.avgPrice || trade["Avg Fill Price"] || 0);

      // Determine if it's a buy or sell from B/S column
      const isBuy = trade["B/S"] && trade["B/S"].trim().toLowerCase() === "buy";
      const signedQuantity = isBuy ? quantity : -quantity;

      console.log("Processing trade:", {
        originalDate: trade.Date,
        quantity,
        price,
        isBuy,
        signedQuantity,
      });

      // Parse date more carefully
      let parsedDate;
      try {
        // Handle Excel date numbers (days since 1900-01-01)
        if (typeof trade.Date === "number") {
          // Excel date: 45902 means 45902 days since 1900-01-01
          // But Excel incorrectly treats 1900 as a leap year, so we need to adjust
          const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
          const daysSinceEpoch = trade.Date - 2; // Subtract 2 because Excel treats 1900 as leap year
          parsedDate = new Date(
            excelEpoch.getTime() + daysSinceEpoch * 24 * 60 * 60 * 1000
          );
          console.log(`Excel date: ${trade.Date} -> ${parsedDate}`);
        }
        // Handle M/D/YY format (e.g., "9/2/25")
        else if (trade.Date && typeof trade.Date === "string") {
          const dateStr = trade.Date.trim();
          // Convert M/D/YY to M/D/YYYY
          if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
            const [month, day, year] = dateStr.split("/");
            const yearNum = parseInt(year);
            // Assume years 00-99 are 2000s (2000-2099)
            const fullYear = 2000 + yearNum;
            parsedDate = new Date(fullYear, parseInt(month) - 1, parseInt(day));
            console.log(
              `Parsed date: ${dateStr} -> ${fullYear}-${month}-${day} -> ${parsedDate}`
            );
          } else {
            parsedDate = new Date(trade.Date);
          }
        } else {
          parsedDate = new Date(trade.Date);
        }

        // Validate the date
        if (isNaN(parsedDate.getTime())) {
          console.warn(`Invalid date: ${trade.Date}`);
          parsedDate = new Date(); // Fallback to current date
        }
      } catch (error) {
        console.warn(`Date parsing error for ${trade.Date}:`, error);
        parsedDate = new Date(); // Fallback to current date
      }

      return {
        ...trade,
        Date: parsedDate,
        Symbol: trade.Contract || trade.Product || "Unknown",
        Quantity: signedQuantity,
        Price: price,
        // Calculate trade value
        Value: Math.abs(signedQuantity) * price,
        // Determine if it's a buy or sell
        Type: isBuy ? "BUY" : "SELL",
        // P&L will be calculated later based on position tracking
        PnL: 0,
        // Keep original data for reference
        OriginalQuantity: quantity,
        OriginalPrice: price,
        OrderType: trade.Type || "Unknown",
        Status: trade.Status,
      };
    });

    // Calculate simple P&L based on position changes
    console.log("Calculating P&L...");
    const tradesWithPnL = await calculateSimplePnL(processedTrades);

    // Calculate daily performance
    console.log("Calculating daily performance...");
    const dailyData = calculateDailyPerformance(tradesWithPnL);
    console.log(`Processed ${dailyData.length} trading days`);
    console.log("Sample daily data:", dailyData.slice(0, 3));

    return {
      trades: tradesWithPnL,
      dailyData: dailyData,
    };
  } catch (error) {
    console.error("Error processing trade data:", error);
    throw new Error(`Failed to process trade data: ${error.message}`);
  }
};

const calculateSimplePnL = async (trades) => {
  // Track positions for each symbol
  const positions = {};
  const tradesWithPnL = [];

  for (const trade of trades) {
    const symbol = trade.Symbol;
    const quantity = Math.abs(trade.Quantity);
    const price = trade.Price;
    const isBuy = trade.Type === "BUY";

    // Get contract specifications
    const specs = await getContractSpecs(symbol);
    console.log(`Contract specs for ${symbol}:`, specs);

    // Calculate fees (excluding clearing fees as requested)
    const commissionPerSide = specs.contractType === "micro" ? 0.35 : 1.29;
    const clearingFeePerContract = 0.19;
    const exchangeFeePerContract = specs.exchangeFee || 1.38;

    const commission = commissionPerSide * quantity;
    const clearingFee = 0; // Clearing fee removed from calculation
    const exchangeFee = exchangeFeePerContract * quantity;
    const totalFees = commission + exchangeFee; // Only commission + exchange fees

    // Initialize position for this symbol if it doesn't exist
    if (!positions[symbol]) {
      positions[symbol] = {
        totalQuantity: 0, // Positive = long, Negative = short
        totalCost: 0, // Total cost basis
        averagePrice: 0, // Average price per share
        realizedPnL: 0, // Total realized P&L
        totalCommission: 0, // Total commission paid
        totalClearingFee: 0, // Total clearing fees paid
        totalExchangeFee: 0, // Total exchange fees paid
        totalFees: 0, // Total all fees paid
        specs: specs, // Store contract specs
      };
    }

    let tradePnL = 0;

    if (isBuy) {
      // BUY: Add to long position or cover short position
      if (positions[symbol].totalQuantity >= 0) {
        // Adding to long position or starting new long position
        positions[symbol].totalQuantity += quantity;
        positions[symbol].totalCost += quantity * price;
        positions[symbol].averagePrice =
          positions[symbol].totalCost / positions[symbol].totalQuantity;
        tradePnL = 0; // No P&L on opening/adding to long position
      } else {
        // Covering short position
        const shortQuantity = Math.abs(positions[symbol].totalQuantity);
        const coverQuantity = Math.min(quantity, shortQuantity);

        // Calculate P&L: (short price - cover price) * quantity
        const priceDifference = positions[symbol].averagePrice - price;
        tradePnL =
          priceDifferenceToDollars(priceDifference, positions[symbol].specs) *
          coverQuantity;
        positions[symbol].realizedPnL += tradePnL;

        // Update position
        positions[symbol].totalQuantity += coverQuantity;
        positions[symbol].totalCost += coverQuantity * price;

        // If we bought more than we needed to cover, start new long position
        if (quantity > shortQuantity) {
          const excessQuantity = quantity - shortQuantity;
          positions[symbol].totalQuantity = excessQuantity;
          positions[symbol].totalCost = excessQuantity * price;
          positions[symbol].averagePrice = price;
        } else if (positions[symbol].totalQuantity === 0) {
          // Position is now flat - reset everything
          positions[symbol].averagePrice = 0;
          positions[symbol].totalCost = 0;
        }
      }
    } else {
      // SELL: Reduce long position or start short position
      if (positions[symbol].totalQuantity > 0) {
        // Selling from long position
        const sellQuantity = Math.min(
          quantity,
          positions[symbol].totalQuantity
        );
        const priceDifference = price - positions[symbol].averagePrice;
        const pnlPerContract = priceDifferenceToDollars(
          priceDifference,
          positions[symbol].specs
        );
        tradePnL = pnlPerContract * sellQuantity;
        positions[symbol].realizedPnL += tradePnL;

        // Update position
        positions[symbol].totalQuantity -= sellQuantity;
        positions[symbol].totalCost -=
          sellQuantity * positions[symbol].averagePrice;

        // If we sold more than we had, start short position
        if (quantity > sellQuantity) {
          const excessQuantity = quantity - sellQuantity;
          positions[symbol].totalQuantity = -excessQuantity;
          positions[symbol].totalCost = -excessQuantity * price;
          positions[symbol].averagePrice = price;
        } else if (positions[symbol].totalQuantity === 0) {
          // Position is now flat - reset everything
          positions[symbol].averagePrice = 0;
          positions[symbol].totalCost = 0;
        }
      } else if (positions[symbol].totalQuantity < 0) {
        // Adding to existing short position
        positions[symbol].totalQuantity -= quantity;
        positions[symbol].totalCost -= quantity * price;
        positions[symbol].averagePrice =
          positions[symbol].totalCost / positions[symbol].totalQuantity;
        tradePnL = 0; // No P&L on adding to short position
      } else {
        // Starting new short position (quantity = 0)
        positions[symbol].totalQuantity = -quantity;
        positions[symbol].totalCost = -quantity * price;
        positions[symbol].averagePrice = price;
        tradePnL = 0; // No P&L on opening short position
      }
    }

    // Add all fees to totals for this symbol
    positions[symbol].totalCommission += commission;
    positions[symbol].totalClearingFee += clearingFee;
    positions[symbol].totalExchangeFee += exchangeFee;
    positions[symbol].totalFees += totalFees;

    // Net P&L after all fees
    const netPnL = tradePnL - totalFees;

    console.log(
      `Trade P&L: ${symbol} | ${
        isBuy ? "BUY" : "SELL"
      } | Qty: ${quantity} | Price: $${price} | Gross P&L: $${tradePnL.toFixed(
        2
      )} | Fees: $${totalFees.toFixed(2)} (Comm: $${commission.toFixed(
        2
      )} + Exch: $${exchangeFee.toFixed(2)}) | Net P&L: $${netPnL.toFixed(2)}`
    );

    tradesWithPnL.push({
      ...trade,
      PnL: netPnL, // Use net P&L after all fees
      Commission: commission,
      ClearingFee: clearingFee,
      ExchangeFee: exchangeFee,
      TotalFees: totalFees,
      GrossPnL: tradePnL, // Keep gross P&L for reference
      PositionAfter: {
        quantity: positions[symbol].totalQuantity,
        averagePrice: positions[symbol].averagePrice,
        realizedPnL: positions[symbol].realizedPnL,
        totalCommission: positions[symbol].totalCommission,
        totalClearingFee: positions[symbol].totalClearingFee,
        totalExchangeFee: positions[symbol].totalExchangeFee,
        totalFees: positions[symbol].totalFees,
      },
    });
  }

  console.log("Final positions:", positions);
  return tradesWithPnL;
};

/**
 * Count actual trades (round trips) by tracking position changes
 * A trade is complete when position returns to zero (completes a round trip)
 */
const countActualTrades = (trades) => {
  const positionTracker = {};
  const tradeCounts = {};

  trades.forEach((trade) => {
    const symbol = trade.Symbol;
    const quantity = trade.Quantity;

    // Initialize position tracker for this symbol
    if (!positionTracker[symbol]) {
      positionTracker[symbol] = 0;
    }
    if (!tradeCounts[symbol]) {
      tradeCounts[symbol] = 0;
    }

    const oldPosition = positionTracker[symbol];
    positionTracker[symbol] += quantity;
    const newPosition = positionTracker[symbol];

    // Count a trade when position returns to zero (completes a round trip)
    // This happens when we were not at zero before, but now we are at zero
    if (oldPosition !== 0 && newPosition === 0) {
      tradeCounts[symbol]++;
    }
  });
  return tradeCounts;
};

export const calculateDailyPerformance = (trades) => {
  console.log("calculateDailyPerformance called with", trades.length, "trades");

  // Group trades by date
  const tradesByDate = {};

  trades.forEach((trade) => {
    try {
      console.log("Processing trade date:", trade.Date, typeof trade.Date);
      const dateKey = format(startOfDay(trade.Date), "yyyy-MM-dd");
      console.log("Date key:", dateKey);
      if (!tradesByDate[dateKey]) {
        tradesByDate[dateKey] = [];
      }
      tradesByDate[dateKey].push(trade);
    } catch (error) {
      console.error("Error processing trade date:", trade.Date, error);
    }
  });

  console.log("Trades grouped by date:", Object.keys(tradesByDate));

  // Calculate daily P&L and performance
  const dailyData = Object.entries(tradesByDate)
    .map(([date, dayTrades]) => {
      console.log(`\n=== Daily P&L for ${date} ===`);
      dayTrades.forEach((trade) => {
        console.log(
          `  ${trade.Symbol}: ${trade.Type} ${trade.Quantity} @ $${
            trade.Price
          } = P&L: $${trade.PnL?.toFixed(2) || 0}`
        );
      });

      // Count actual trades (round trips) for this day
      const actualTradeCounts = countActualTrades(dayTrades);
      const totalActualTrades = Object.values(actualTradeCounts).reduce(
        (sum, count) => sum + count,
        0
      );

      const totalPnL = dayTrades.reduce(
        (sum, trade) => sum + (trade.PnL || 0),
        0
      );
      const totalCommission = dayTrades.reduce(
        (sum, trade) => sum + (trade.Commission || 0),
        0
      );
      const totalClearingFee = dayTrades.reduce(
        (sum, trade) => sum + (trade.ClearingFee || 0),
        0
      );
      const totalExchangeFee = dayTrades.reduce(
        (sum, trade) => sum + (trade.ExchangeFee || 0),
        0
      );
      const totalFees = dayTrades.reduce(
        (sum, trade) => sum + (trade.TotalFees || 0),
        0
      );
      const totalValue = dayTrades.reduce(
        (sum, trade) => sum + Math.abs(trade.Value),
        0
      );
      const winCount = dayTrades.filter((trade) => (trade.PnL || 0) > 0).length;
      const lossCount = dayTrades.filter(
        (trade) => (trade.PnL || 0) < 0
      ).length;
      const neutralCount = dayTrades.filter(
        (trade) => (trade.PnL || 0) === 0
      ).length;

      console.log(
        `  Total P&L: $${totalPnL.toFixed(
          2
        )} | Total Fees: $${totalFees.toFixed(
          2
        )} (Comm: $${totalCommission.toFixed(
          2
        )} + Exch: $${totalExchangeFee.toFixed(
          2
        )}) | Total Value: $${totalValue.toFixed(2)} | Transactions: ${
          dayTrades.length
        } | Actual Trades: ${totalActualTrades}`
      );

      return {
        date: parseISO(date),
        dateString: date,
        totalPnL,
        totalCommission,
        totalClearingFee,
        totalExchangeFee,
        totalFees,
        totalValue,
        tradeCount: totalActualTrades, // Use actual trade count instead of transaction count
        transactionCount: dayTrades.length, // Keep transaction count for reference
        winCount,
        lossCount,
        neutralCount,
        isWin: totalPnL > 0,
        isLoss: totalPnL < 0,
        isNeutral: totalPnL === 0,
      };
    })
    .sort((a, b) => a.date - b.date);

  // Calculate cumulative performance
  let cumulativePnL = 0;
  const dailyDataWithCumulative = dailyData.map((day) => {
    cumulativePnL += day.totalPnL;
    return {
      ...day,
      cumulativePnL,
      performance:
        day.totalValue > 0 ? (day.totalPnL / day.totalValue) * 100 : 0,
    };
  });

  return dailyDataWithCumulative;
};

export const getPerformanceStats = (dailyData) => {
  if (!dailyData || dailyData.length === 0) {
    return {
      totalTrades: 0,
      totalPnL: 0,
      winRate: 0,
      bestDay: null,
      worstDay: null,
      avgDailyPnL: 0,
    };
  }

  const totalTrades = dailyData.reduce((sum, day) => sum + day.tradeCount, 0);
  const totalPnL = dailyData.reduce((sum, day) => sum + day.totalPnL, 0);
  const winDays = dailyData.filter((day) => day.isWin).length;
  const winRate = dailyData.length > 0 ? (winDays / dailyData.length) * 100 : 0;

  const bestDay = dailyData.reduce(
    (best, day) => (day.totalPnL > best.totalPnL ? day : best),
    dailyData[0]
  );

  const worstDay = dailyData.reduce(
    (worst, day) => (day.totalPnL < worst.totalPnL ? day : worst),
    dailyData[0]
  );

  const avgDailyPnL = dailyData.length > 0 ? totalPnL / dailyData.length : 0;

  return {
    totalTrades,
    totalPnL,
    winRate,
    bestDay,
    worstDay,
    avgDailyPnL,
  };
};
