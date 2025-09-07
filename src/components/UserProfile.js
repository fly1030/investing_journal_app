import React, { useState } from "react";
import { signOutUser } from "../firebase/auth";
import { User, LogOut, Settings, FileText } from "lucide-react";

const UserProfile = ({ user, onSignOut }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    const result = await signOutUser();
    if (result.success) {
      onSignOut();
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 12px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
          color: "#374151",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: "#3b82f6",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          {user.displayName
            ? user.displayName.charAt(0).toUpperCase()
            : user.email.charAt(0).toUpperCase()}
        </div>
        <span>{user.displayName || user.email}</span>
      </button>

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            marginTop: "8px",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            minWidth: "200px",
            zIndex: 1000,
          }}
        >
          <div style={{ padding: "8px 0" }}>
            <div
              style={{
                padding: "8px 16px",
                fontSize: "12px",
                color: "#6b7280",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              {user.email}
            </div>

            <button
              onClick={() => setShowDropdown(false)}
              style={{
                width: "100%",
                padding: "8px 16px",
                border: "none",
                background: "none",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "#374151",
              }}
            >
              <User size={16} />
              Profile
            </button>

            <button
              onClick={() => setShowDropdown(false)}
              style={{
                width: "100%",
                padding: "8px 16px",
                border: "none",
                background: "none",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "#374151",
              }}
            >
              <Settings size={16} />
              Settings
            </button>

            <button
              onClick={() => setShowDropdown(false)}
              style={{
                width: "100%",
                padding: "8px 16px",
                border: "none",
                background: "none",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "#374151",
              }}
            >
              <FileText size={16} />
              My Files
            </button>

            <div style={{ borderTop: "1px solid #f3f4f6", margin: "4px 0" }} />

            <button
              onClick={handleSignOut}
              style={{
                width: "100%",
                padding: "8px 16px",
                border: "none",
                background: "none",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "#dc2626",
              }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
