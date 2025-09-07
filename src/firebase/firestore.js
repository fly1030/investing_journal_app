import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// User-specific document helpers
const getUserDoc = (userId, collectionName, docId) => {
  return doc(db, "users", userId, collectionName, docId);
};

// Save user's trading data
export const saveTradingData = async (
  userId,
  tradingData,
  accountId = "current"
) => {
  try {
    const userDoc = getUserDoc(userId, "tradingData", accountId);
    await setDoc(userDoc, {
      ...tradingData,
      lastUpdated: serverTimestamp(),
      userId: userId,
      accountId: accountId,
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving trading data:", error);
    return { success: false, error: error.message };
  }
};

// Load user's trading data
export const loadTradingData = async (userId, accountId = "current") => {
  try {
    const userDoc = getUserDoc(userId, "tradingData", accountId);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error("Error loading trading data:", error);
    return { success: false, error: error.message };
  }
};

// Save user settings
export const saveUserSettings = async (userId, settings) => {
  try {
    const userDoc = getUserDoc(userId, "settings", "preferences");
    await setDoc(userDoc, {
      ...settings,
      lastUpdated: serverTimestamp(),
      userId: userId,
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving user settings:", error);
    return { success: false, error: error.message };
  }
};

// Load user settings
export const loadUserSettings = async (userId) => {
  try {
    const userDoc = getUserDoc(userId, "settings", "preferences");
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      return { success: true, settings: docSnap.data() };
    } else {
      return { success: true, settings: null };
    }
  } catch (error) {
    console.error("Error loading user settings:", error);
    return { success: false, error: error.message };
  }
};

// Delete user data (for account deletion)
export const deleteUserData = async (userId) => {
  try {
    // Delete trading data
    const tradingDataDoc = getUserDoc(userId, "tradingData", "current");
    await deleteDoc(tradingDataDoc);

    // Delete settings
    const settingsDoc = getUserDoc(userId, "settings", "preferences");
    await deleteDoc(settingsDoc);

    // All user data deleted successfully
    return { success: true };
  } catch (error) {
    console.error("Error deleting user data:", error);
    return { success: false, error: error.message };
  }
};
