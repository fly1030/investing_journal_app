import React, { useState } from "react";
import {
  Plus,
  Upload,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronDown,
} from "lucide-react";

const AccountSelector = ({
  accounts,
  selectedAccountIds,
  onSelectAccounts,
  onCreateAccount,
  onUpdateAccount,
  onDeleteAccount,
  onUploadToAccount,
  hasExistingData,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editingAccountName, setEditingAccountName] = useState("");

  const handleCreateAccount = () => {
    if (newAccountName.trim()) {
      onCreateAccount(newAccountName.trim());
      setNewAccountName("");
      setIsCreating(false);
    }
  };

  const handleEditStart = (account) => {
    setEditingAccountId(account.id);
    setEditingAccountName(account.name);
  };

  const handleEditSave = (accountId) => {
    if (editingAccountName.trim()) {
      onUpdateAccount(accountId, editingAccountName.trim());
      setEditingAccountId(null);
      setEditingAccountName("");
    }
  };

  const handleEditCancel = () => {
    setEditingAccountId(null);
    setEditingAccountName("");
  };

  const handleDeleteAccount = (accountId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this account? This will permanently remove all trading data and journals for this account."
      )
    ) {
      onDeleteAccount(accountId);
    }
  };

  const toggleAccountSelection = (accountId) => {
    if (selectedAccountIds.includes(accountId)) {
      onSelectAccounts(selectedAccountIds.filter((id) => id !== accountId));
    } else {
      onSelectAccounts([...selectedAccountIds, accountId]);
    }
  };

  const selectedAccounts = accounts.filter((account) =>
    selectedAccountIds.includes(account.id)
  );

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* Account Selector */}
        <div style={{ position: "relative", minWidth: "200px" }}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              backgroundColor: "#f8fafc",
              cursor: "pointer",
              minWidth: "200px",
              height: "40px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              transition: "all 0.2s",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              {selectedAccounts.length === 0
                ? "Select Accounts"
                : selectedAccounts.length === 1
                ? selectedAccounts[0].name
                : `${selectedAccounts.length} accounts`}
            </div>
            <ChevronDown
              size={20}
              style={{
                color: "#6b7280",
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          </div>

          {isDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                zIndex: 1000,
                maxHeight: "300px",
                overflowY: "auto",
                marginTop: "4px",
              }}
            >
              {/* Create New Account */}
              {isCreating ? (
                <div
                  style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}
                >
                  <div
                    style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                  >
                    <input
                      type="text"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                      placeholder="Account name"
                      style={{
                        flexGrow: 1,
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        fontSize: "14px",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateAccount();
                        if (e.key === "Escape") setIsCreating(false);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={handleCreateAccount}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => setIsCreating(false)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsCreating(true)}
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #e5e7eb",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#3b82f6",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  <Plus size={16} />
                  Create New Account
                </div>
              )}

              {/* Account List */}
              {accounts.map((account) => (
                <div
                  key={account.id}
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexGrow: 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAccountIds.includes(account.id)}
                      onChange={() => toggleAccountSelection(account.id)}
                      style={{ margin: 0 }}
                    />

                    {editingAccountId === account.id ? (
                      <input
                        type="text"
                        value={editingAccountName}
                        onChange={(e) => setEditingAccountName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave(account.id);
                          if (e.key === "Escape") handleEditCancel();
                        }}
                        style={{
                          flexGrow: 1,
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid #3b82f6",
                          fontSize: "14px",
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#1e293b",
                          flexGrow: 1,
                        }}
                      >
                        {account.name}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "4px" }}>
                    {editingAccountId === account.id ? (
                      <>
                        <button
                          onClick={() => handleEditSave(account.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#16a34a",
                            padding: "4px",
                          }}
                          title="Save"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={handleEditCancel}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#dc2626",
                            padding: "4px",
                          }}
                          title="Cancel"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onUploadToAccount(account.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#3b82f6",
                            padding: "4px",
                          }}
                          title="Upload data to this account"
                        >
                          <Upload size={16} />
                        </button>
                        <button
                          onClick={() => handleEditStart(account)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#6b7280",
                            padding: "4px",
                          }}
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#dc2626",
                            padding: "4px",
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSelector;
