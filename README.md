# BannerApp - AI-Powered Banner Generator

A modern web application for generating AI-powered banner headlines with authentication and data management.

## Features

✅ **User Authentication** - Sign up and log in
✅ **Banner Generation** - Generate banners with AI-powered prompts
✅ **Data Export** - Export all user and banner data to JSON
✅ **Local Storage** - Secure data storage with LocalStorage
✅ **Modern UI** - Glassmorphism design with smooth animations

---

## File Structure

```
banner/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling with responsive design
├── app.js          # JavaScript logic (DB, Auth, UI)
├── data.json       # Template data file
└── README.md       # This file
```

---

## Getting Started

### 1. Open the Application
- Open `index.html` in your web browser
- You'll see a login/signup prompt

### 2. Create an Account
- Click **"Get Started"** button
- Enter a username and password (min 6 characters)
- Confirm your password
- Account created! You're now logged in

### 3. Generate Banners
- Enter a theme/prompt (e.g., "futuristic coffee shop")
- Click **"Generate Banner"**
- Wait for AI to process (simulated 1.2 seconds)
- View the generated headline and description
- Click **"Save to JSON"** to store the banner

### 4. Logout
- Click your username in the top navigation
- Click **"Logout"** to sign out

---

## Browser Console Commands

Open your browser's Developer Console (F12) and use these commands:

### Export All Data
```javascript
ExportCommand.exportAllData()
```
Downloads `bannerapp-data-YYYY-MM-DD.json` with all users and banners.

### View All Users
```javascript
ExportCommand.viewAllUsers()
```
Logs all registered users in a table format.

### View All Banners
```javascript
ExportCommand.viewAllBanners()
```
Logs all saved banners in a table format.

### Clear All Data
```javascript
ExportCommand.clearAllData()
```
⚠️ **WARNING**: Deletes all stored data (requires confirmation).

### Manual Data Access
```javascript
// Get users
MockDB.getUsers()

// Get all banners
JSON.parse(localStorage.getItem('app_banners'))

// Get current user
JSON.parse(localStorage.getItem('current_user'))

// Get formatted data
MockDB.getAllData()
```

---

## Data Structure

### User Object
```json
{
  "id": 1234567890,
  "username": "john_doe",
  "password": "encrypted_password",
  "created": "2024-03-27T10:30:00.000Z"
}
```

### Banner Object
```json
{
  "id": 1234567891,
  "userId": 1234567890,
  "title": "Discover Innovation",
  "desc": "Crafted by Gemini AI for your unique brand identity.",
  "created": "2024-03-27T10:35:00.000Z"
}
```

### Exported JSON Format
```json
{
  "users": [...],
  "banners": [...],
  "exported": "2024-03-27T15:30:00.000Z"
}
```

---

## Data Storage

- **LocalStorage Keys Used:**
  - `app_users` - Array of all registered users
  - `app_banners` - Array of all generated banners
  - `current_user` - Currently logged-in user

⚠️ **Note**: Data persists in browser local storage. Clearing browser data will delete all stored information.

---

## File Linking

All files are properly linked:
- HTML links to `styles.css` (corrected from "style.css")
- HTML links to `app.js` (no module type, standard script)
- JavaScript manages DOM elements by their IDs

---

## Troubleshooting

### Forgot Password?
- Clear browser data for this site
- Reload the page
- Create a new account

### Data Not Saving?
- Check browser console for errors (F12)
- Ensure LocalStorage is enabled
- Try a different browser

### Export Not Working?
- Make sure you're logged in
- Generate at least one banner first
- Check pop-up blocker settings

---

## Browser Compatibility

✅ Chrome 60+
✅ Firefox 55+
✅ Safari 11+
✅ Edge 79+

---

## Security Notes

⚠️ This is a demo application using LocalStorage.
- Passwords are stored in plain text (for demo purposes)
- In production, use proper authentication and encryption
- Never use this for sensitive real-world applications

---

## Customization

### Change Theme Colors
Edit `:root` variables in `styles.css`:
```css
:root {
    --primary: #6366f1;      /* Change primary color */
    --dark: #0f172a;         /* Change background */
    --success: #10b981;      /* Success messages */
    --error: #ef4444;        /* Error messages */
}
```

### Modify Banner Generation
Edit `mockAiCall()` in `app.js` to change how banners are generated.

---

## Support

For issues or questions:
1. Check the browser console (F12) for error messages
2. Verify all files are in the same folder
3. Try clearing browser cache and reloading

---

**Last Updated:** March 27, 2024
