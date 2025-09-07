import * as XLSX from "xlsx";

export const parseFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let jsonData;

        // Check if it's a CSV file
        if (file.type === "text/csv" || file.name.endsWith(".csv")) {
          // Parse CSV directly using XLSX library for better handling
          const csvText = e.target.result;
          const workbook = XLSX.read(csvText, { type: "string" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON
          const csvData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (csvData.length < 2) {
            throw new Error(
              "CSV file must contain at least a header row and one data row"
            );
          }

          const headers = csvData[0];
          console.log("CSV Headers:", headers);

          jsonData = csvData
            .slice(1)
            .filter((row) =>
              row.some((cell) => cell !== undefined && cell !== "")
            )
            .map((row) => {
              const trade = {};
              headers.forEach((header, index) => {
                if (header && row[index] !== undefined) {
                  trade[header] = row[index];
                }
              });
              return trade;
            })
            .filter((trade) => {
              // Pre-filter: ignore canceled orders
              const status = trade.Status
                ? trade.Status.trim().toLowerCase()
                : "";
              const isCanceled =
                status === "canceled" ||
                status === "cancel" ||
                status === "cancelled";
              return !isCanceled;
            });

          console.log("First parsed row:", jsonData[0]);
        } else {
          // Parse Excel file
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });

          // Get the first worksheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON
          const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (excelData.length < 2) {
            throw new Error(
              "File must contain at least a header row and one data row"
            );
          }

          // Extract headers and data
          const headers = excelData[0];
          const rows = excelData.slice(1);

          // Map rows to objects
          jsonData = rows
            .filter((row) =>
              row.some((cell) => cell !== undefined && cell !== "")
            )
            .map((row) => {
              const trade = {};
              headers.forEach((header, index) => {
                if (header && row[index] !== undefined) {
                  trade[header] = row[index];
                }
              });
              return trade;
            })
            .filter((trade) => {
              // Pre-filter: ignore canceled orders
              const status = trade.Status
                ? trade.Status.trim().toLowerCase()
                : "";
              const isCanceled =
                status === "canceled" ||
                status === "cancel" ||
                status === "cancelled";
              return !isCanceled;
            });
        }

        if (jsonData.length === 0) {
          throw new Error("No data found in file");
        }

        resolve({ headers: Object.keys(jsonData[0]), trades: jsonData });
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    // Use text reading for CSV, array buffer for Excel
    if (file.type === "text/csv" || file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

export const validateTradeData = (trades) => {
  const errors = [];

  if (trades.length === 0) {
    errors.push("No trade data found");
    return errors;
  }

  // Check if we have the required fields for this format
  const firstTrade = trades[0];
  const availableFields = Object.keys(firstTrade);

  console.log("Available fields:", availableFields);

  // Check for required fields with flexible matching
  const hasDate = firstTrade.Date;
  const hasContract = firstTrade.Contract;
  const hasQuantity = firstTrade.filledQty || firstTrade["Filled Qty"];
  const hasPrice = firstTrade.avgPrice || firstTrade["Avg Fill Price"];
  const hasStatus = firstTrade.Status;

  console.log("Field checks:", {
    Date: hasDate,
    Contract: hasContract,
    filledQty: firstTrade.filledQty,
    "Filled Qty": firstTrade["Filled Qty"],
    avgPrice: firstTrade.avgPrice,
    "Avg Fill Price": firstTrade["Avg Fill Price"],
    Status: hasStatus,
  });

  if (!hasDate) {
    errors.push("Missing 'Date' column");
  }
  if (!hasContract) {
    errors.push("Missing 'Contract' column");
  }
  if (!hasQuantity) {
    errors.push("Missing quantity column (filledQty or Filled Qty)");
  }
  if (!hasPrice) {
    errors.push("Missing price column (avgPrice or Avg Fill Price)");
  }
  if (!hasStatus) {
    errors.push("Missing 'Status' column");
  }

  if (errors.length > 0) {
    errors.unshift("Missing required columns:");
    return errors;
  }

  // Count non-canceled trades (canceled orders are already filtered out)
  const nonCanceledTrades = trades.filter(
    (trade) => trade.Status && trade.Status.trim() !== "Canceled"
  );

  if (nonCanceledTrades.length === 0) {
    errors.push("No valid trades found. All trades appear to be canceled.");
  }

  return errors;
};
