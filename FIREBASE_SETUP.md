# Firebase Setup Guide

## 🚀 Getting Started with Firebase

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `investing-journal-app`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password** authentication
5. Click "Save"

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

### 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" and select **Web** (</> icon)
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 5. Update Your App Configuration

Replace the placeholder values in `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id",
};
```

### 6. Set up Firestore Security Rules

Go to **Firestore Database** → **Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🎯 Features Enabled

✅ **User Authentication**: Email/password sign up and sign in
✅ **Data Persistence**: User-specific processed trading data storage
✅ **Efficient Storage**: Only clean data stored (no cancelled trades)
✅ **Security**: Users can only access their own data
✅ **Multi-user Support**: Each user has isolated data

## 🔧 How It Works

### Data Flow:

1. **User uploads CSV** → App processes and filters out cancelled trades
2. **Processed data** → Stored directly in Firestore (no file storage needed)
3. **User signs in** → App loads their processed trading data
4. **Dashboard** → Shows their trading performance and calendar

### Benefits:

- 🚀 **Fast**: No file re-processing needed
- 💰 **Cost-effective**: No file storage costs
- 🧹 **Clean**: Only stores relevant trading data
- 🔒 **Secure**: User data isolation

## 🔧 Data Structure

### Firestore Collections:

```
users/{userId}/
├── tradingData/
│   └── current/ (processed trading data)
└── settings/
    └── preferences/ (user settings)
```

## 🚀 Next Steps

1. Update the Firebase configuration in `src/firebase/config.js`
2. Test the authentication flow
3. Upload a CSV file to test data persistence
4. Sign out and sign back in to verify data loads correctly

## 🔒 Security Notes

- The current rules allow full access to user data
- For production, consider more restrictive rules
- Enable Firebase App Check for additional security
- Consider implementing data validation rules
