# BannerApp - Complete Features Guide

## ✨ New Features Added

### 1. Enhanced User Authentication
- **Better Credential Validation**
  - Username must be 3+ characters
  - Password must be 6+ characters
  - Clear error messages for each validation failure

- **Specific Error Messages**
  - "User does not exist" - Account not found
  - "Invalid password" - Wrong password for existing user
  - "User already exists" - Can't create duplicate account
  - "Username/Password cannot be empty" - Required fields

---

## 🖼️ Image Management Features

### Upload an Image
1. Generate a banner (enter theme and click "Generate Banner")
2. Click the **"Upload Image"** button
3. Select an image from your computer (max 5MB)
4. The image will display in the preview
5. Click **"Save to JSON"** to store the image with your banner

### Download an Image
1. After uploading an image to a banner
2. Click the **"Download Image"** button
3. The image downloads to your computer as `banner-[timestamp].png`

### View Images
- All uploaded images display in the banner preview area
- Images are stored as Base64 in the JSON database
- Images are visible when you export your data

---

## 💾 Data Persistence

### What Gets Saved
✅ User credentials (username + password)
✅ All generated banners (title + description)
✅ Uploaded images (stored as Base64)
✅ Creation timestamps
✅ User IDs and associations

### Where Data is Stored
- **Browser LocalStorage** - Persists across sessions
- **JSON Files** - Export and save locally
- **No server required** - Everything stays on your device

---

## 📥 Data Export & Download

### Export Full Database
```javascript
// Run in browser console (F12):
ExportCommand.exportAllData()
```
Downloads `bannerapp-data-YYYY-MM-DD.json` containing:
- All registered users
- All banners with images
- Export timestamp

### Export from UI
1. Generate a banner
2. (Optional) Upload an image
3. Click **"Save to JSON"** button
4. JSON file downloads automatically

---

## 🛠️ Browser Console Commands

Open Developer Tools (F12) and use these commands:

### View All Users
```javascript
ExportCommand.viewAllUsers()
// Shows table: id, username, password, created
```

### View All Banners
```javascript
ExportCommand.viewAllBanners()
// Shows table: id, userId, title, desc, image, created
```

### View User's Banners
```javascript
ExportCommand.viewUserBanners(userId)
// Replace userId with actual user ID
```

### Get Raw Data
```javascript
MockDB.getAllData()
// Returns complete database object
```

### Get Specific User
```javascript
MockDB.getUsers()
// Returns array of all users
```

### Clear All Data (⚠️ WARNING)
```javascript
ExportCommand.clearAllData()
// Requires confirmation - deletes everything
```

---

## 🔐 Credential Validation Examples

### ✅ Valid Sign Up
```
Username: "john_doe"      ✓ (7 characters)
Password: "secure123"     ✓ (9 characters)
Confirm:  "secure123"     ✓ (matches)
```
✅ Account created successfully

### ❌ Invalid Sign Up Examples

**Username too short:**
```
Username: "ab"            ✗ (only 2 characters)
Error: "Username must be at least 3 characters"
```

**Password too short:**
```
Password: "pass"          ✗ (only 4 characters)
Error: "Password must be at least 6 characters"
```

**Passwords don't match:**
```
Password:        "pass123"
Confirm:         "pass456"   ✗
Error: "Passwords do not match"
```

**User already exists:**
```
Username: "john_doe"      ✗ (already registered)
Error: "User already exists. Please login instead."
```

### ✅ Valid Login
```
Username: "john_doe"
Password: "secure123"
```
✅ Login successful → Access to banner generator

### ❌ Invalid Login Examples

**Wrong password:**
```
Username: "john_doe"      ✓ (exists)
Password: "wrongpass"     ✗
Error: "Invalid password. Please try again."
```

**User doesn't exist:**
```
Username: "jane_doe"      ✗ (not registered)
Password: "anypass"
Error: "User does not exist. Please Sign Up."
```

---

## 📊 Data Structure

### User Object
```json
{
  "id": 1711529200000,
  "username": "john_doe",
  "password": "secure123",
  "created": "2026-03-27T10:30:00.000Z"
}
```

### Banner Object
```json
{
  "id": 1711529300000,
  "userId": 1711529200000,
  "title": "Discover Coffee",
  "desc": "Crafted by Gemini AI for your unique brand identity.",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "created": "2026-03-27T10:35:00.000Z"
}
```

### Exported JSON
```json
{
  "users": [
    { user objects... }
  ],
  "banners": [
    { banner objects with images... }
  ],
  "exported": "2026-03-27T15:30:00.000Z"
}
```

---

## 🎯 Workflow Examples

### Example 1: Create Account & Generate Banner
1. Open `index.html`
2. Click **"Get Started"**
3. Enter username: `creative_user`
4. Enter password: `mypassword123`
5. Click **"Get Started"**
6. ✅ Account created, logged in
7. Enter prompt: "Modern tech startup"
8. Click **"Generate Banner"**
9. Upload an image or leave it blank
10. Click **"Save to JSON"**
11. Download `bannerapp-data-2026-03-27.json`

### Example 2: Login & Generate Multiple Banners
1. Click **"Sign In"**
2. Enter credentials
3. ✅ Logged in
4. Generate Banner #1: "E-commerce website"
5. Upload image
6. Save to JSON
7. Generate Banner #2: "Fashion brand"
8. Upload image
9. Save to JSON
10. Run `ExportCommand.viewAllBanners()`
11. See both banners in console table

### Example 3: Check User Data
1. Open console (F12)
2. Type: `ExportCommand.viewAllUsers()`
3. View all registered users in table
4. Type: `ExportCommand.viewUserBanners(userId)`
5. See all banners for specific user

---

## 🐛 Troubleshooting

### If Login Shows "Invalid Credentials"
- ❌ Check username spelling (case-sensitive)
- ❌ Verify password exactly
- ✅ Try clicking "Sign Up" to check if user exists

### If Image Won't Upload
- ❌ File must be an image (jpg, png, gif, etc.)
- ❌ File size must be under 5MB
- ✅ Try a different image file

### If Download Doesn't Work
- ❌ Check browser pop-up blocker
- ❌ Ensure you're in HTTPS or localhost
- ✅ Allow pop-ups for this website

### If JSON File is Missing Data
- ❌ Make sure you saved the banner (click "Save to JSON")
- ✅ Check browser console for errors (F12)
- ✅ Verify LocalStorage has data: `MockDB.getAllData()`

---

## 🔄 Account Management

### Change Password
Currently not available. To reset:
1. Click "Logout"
2. Click "Get Started" to create new account
3. Or use console: `ExportCommand.clearAllData()` and start fresh

### Delete Account
```javascript
// Clear all data and logout
ExportCommand.clearAllData()
```

### Export Personal Data
```javascript
// Get all your data
ExportCommand.exportAllData()
// Downloads JSON file with your profile & banners
```

---

## 🎨 Features Summary

| Feature | Status | Details |
|---------|--------|---------|
| User Registration | ✅ | Email-less signup with validation |
| User Login | ✅ | Auto-remember session |
| Password Security | ✅ | Min 6 characters, validation |
| Banner Generation | ✅ | AI-powered (simulated) |
| Image Upload | ✅ | Supports all image formats, max 5MB |
| Image Download | ✅ | Download uploaded images |
| Image Preview | ✅ | View before saving |
| JSON Export | ✅ | Full database export |
| Data Persistence | ✅ | LocalStorage + Export |
| Error Messages | ✅ | Detailed, user-friendly |
| Responsive Design | ✅ | Works on mobile/tablet |

---

## 📝 Notes
- Data is stored in browser LocalStorage
- Clearing browser cache will delete all data
- Use the export feature to backup important data
- Passwords are stored as plain text (demo only)
- For production: Use proper authentication & encryption

---

**Last Updated:** March 27, 2026
