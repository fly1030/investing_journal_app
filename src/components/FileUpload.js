import React, { useCallback, useState } from "react";
import { FileSpreadsheet, AlertCircle } from "lucide-react";

const FileUpload = ({ onFileUpload, loading, error, hasExistingData }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadMode, setUploadMode] = useState("replace");

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const supportedFile = files.find(
        (file) =>
          file.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.type === "application/vnd.ms-excel" ||
          file.type === "text/csv" ||
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls") ||
          file.name.endsWith(".csv")
      );

      if (supportedFile) {
        onFileUpload(supportedFile, uploadMode);
      }
    },
    [onFileUpload]
  );

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (file) {
        onFileUpload(file, uploadMode);
      }
    },
    [onFileUpload, uploadMode]
  );

  return (
    <div className="card">
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h2
          style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "8px" }}
        >
          Upload Your Trade Data
        </h2>
        <p style={{ color: "#64748b" }}>
          Upload a CSV or Excel file (.csv, .xlsx, or .xls) containing your
          trade data
        </p>

        {/* Upload Mode Selection */}
        {hasExistingData && (
          <div style={{ marginBottom: "24px" }}>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "12px",
                textAlign: "left",
              }}
            >
              Upload Mode:
            </h4>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor:
                    uploadMode === "replace" ? "#eff6ff" : "#f8fafc",
                  border:
                    uploadMode === "replace"
                      ? "1px solid #3b82f6"
                      : "1px solid #e5e7eb",
                  transition: "all 0.2s",
                }}
              >
                <input
                  type="radio"
                  name="uploadMode"
                  value="replace"
                  checked={uploadMode === "replace"}
                  onChange={(e) => setUploadMode(e.target.value)}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Replace All Data
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor:
                    uploadMode === "append" ? "#eff6ff" : "#f8fafc",
                  border:
                    uploadMode === "append"
                      ? "1px solid #3b82f6"
                      : "1px solid #e5e7eb",
                  transition: "all 0.2s",
                }}
              >
                <input
                  type="radio"
                  name="uploadMode"
                  value="append"
                  checked={uploadMode === "append"}
                  onChange={(e) => setUploadMode(e.target.value)}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Add to Existing
                </span>
              </label>
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginTop: "8px",
                textAlign: "center",
              }}
            >
              {uploadMode === "replace"
                ? "This will replace all existing trading data for this account"
                : "This will add new trades to your existing data (duplicates will be merged)"}
            </p>
          </div>
        )}
      </div>

      <div
        className={`file-upload ${isDragOver ? "dragover" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-input").click()}
        style={{ cursor: "pointer" }}
      >
        <div className="upload-icon">
          <FileSpreadsheet size={48} />
        </div>
        <div className="upload-text">
          {isDragOver
            ? "Drop your file here"
            : "Click to upload or drag and drop"}
        </div>
        <div className="upload-subtext">
          Supports .csv, .xlsx and .xls files
        </div>
      </div>

      <input
        id="file-input"
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileSelect}
        style={{ display: "none" }}
        disabled={loading}
      />

      {loading && (
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <div
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              border: "2px solid #e5e7eb",
              borderTop: "2px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ marginTop: "8px", color: "#64748b" }}>
            Processing your data...
          </p>
          <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
            This may take a moment for large files. Check the browser console
            for progress.
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
          }}
        >
          <AlertCircle size={20} />
          <div>
            <div style={{ fontWeight: "500" }}>Upload Error</div>
            <div style={{ fontSize: "14px", marginTop: "4px" }}>
              {error.split("\n").map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
        }}
      >
        <h3
          style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "12px" }}
        >
          Expected File Format
        </h3>
        <div style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.5" }}>
          <p style={{ marginBottom: "8px" }}>
            Your file should contain trading data with these key columns:
          </p>
          <ul style={{ marginLeft: "20px", marginBottom: "12px" }}>
            <li>
              <strong>Date</strong> - Trade date (e.g., 9/2/25)
            </li>
            <li>
              <strong>Contract</strong> - Symbol/contract code (e.g., NQU5,
              ESU5)
            </li>
            <li>
              <strong>B/S</strong> - Buy/Sell indicator (" Buy" or " Sell")
            </li>
            <li>
              <strong>filledQty</strong> or <strong>Filled Qty</strong> - Number
              of contracts
            </li>
            <li>
              <strong>avgPrice</strong> or <strong>Avg Fill Price</strong> -
              Fill price
            </li>
            <li>
              <strong>Status</strong> - Order status (only "Filled" orders are
              processed)
            </li>
          </ul>
          <p style={{ fontSize: "13px", fontStyle: "italic" }}>
            Only trades with Status="Filled" will be processed. Canceled orders
            are ignored.
          </p>
        </div>
      </div>

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
};

export default FileUpload;
