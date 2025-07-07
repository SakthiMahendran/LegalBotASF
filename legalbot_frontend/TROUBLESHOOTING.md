# LegalBot Frontend Troubleshooting Guide

## Issue: "Sorry, I encountered an error. Please try again."

This error typically occurs when the frontend cannot communicate properly with the Django backend. Here are the solutions:

### ✅ **SOLUTION IMPLEMENTED**

I've fixed the main authentication issue by implementing auto-login functionality. The frontend now automatically authenticates with demo credentials when it loads.

### **What Was Fixed:**

1. **Auto-Authentication**: The app now automatically logs in with test credentials (`test@example.com` / `testpass123`)
2. **Better Error Handling**: More specific error messages based on HTTP status codes
3. **Authentication State Management**: Proper handling of authentication state across the app
4. **Session Creation**: Fixed session creation to work with authenticated users

### **Current Status:**

- ✅ Frontend running on http://localhost:5173
- ✅ Auto-authentication implemented
- ✅ Better error messages
- ✅ Proper state management

## **How to Test:**

1. **Make sure Django backend is running:**
   ```bash
   cd LegalBot
   python manage.py runserver
   ```

2. **Frontend should be running on:**
   ```
   http://localhost:5173
   ```

3. **Test the flow:**
   - Open http://localhost:5173
   - App should auto-authenticate (you'll see "Authenticating..." briefly)
   - Click "Start Creating Documents" or create a new session
   - Try chatting with the AI

## **If You Still Get Errors:**

### **Check Backend Status:**
```bash
# Test if Django is running
curl http://localhost:8000/api/ai/health/
# Should return: {"status":"healthy","ai_configured":true,"modules_loaded":true,"debug_mode":true}
```

### **Check Frontend Console:**
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for detailed error messages
4. Check Network tab for failed requests

### **Common Issues & Solutions:**

#### **1. CORS Errors**
If you see CORS errors in the browser console:
- Make sure Django settings allow `localhost:5173`
- Check that `CORS_ALLOW_ALL_ORIGINS = True` in Django settings

#### **2. Authentication Errors**
If auto-login fails:
- Check if test user exists in Django
- Try manual login with: `test@example.com` / `testpass123`
- Check Django logs for authentication errors

#### **3. API Endpoint Errors**
If specific API calls fail:
- Check Django is running on port 8000
- Verify API endpoints are accessible
- Check Django logs for detailed error messages

#### **4. Session Creation Errors**
If session creation fails:
- Make sure user is authenticated
- Check Django user model and session model
- Verify database migrations are applied

### **Manual Testing Commands:**

```bash
# Test backend health
curl http://localhost:8000/api/ai/health/

# Test authentication
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123"}'

# Test session creation (with auth token)
curl -X GET http://localhost:8000/api/sessions/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **Debug Mode:**

I've added a debug component. To access it:
1. Uncomment the debug button in Layout.jsx
2. Click "Debug API" in the sidebar
3. Test individual API endpoints

### **Reset Everything:**

If nothing works, try this reset:

1. **Stop both servers**
2. **Reset Django database:**
   ```bash
   cd LegalBot
   rm db.sqlite3
   python manage.py migrate
   python manage.py runserver
   ```
3. **Clear browser data:**
   - Clear cookies and localStorage for localhost:5173
4. **Restart frontend:**
   ```bash
   cd legalbot_frontend
   npm run dev
   ```

## **Expected Behavior:**

1. **Page Load**: Auto-authentication happens in background
2. **Welcome Screen**: Shows with "Start Creating Documents" button enabled
3. **Session Creation**: Creates new session when button clicked
4. **Chat Interface**: Allows typing and sending messages
5. **AI Response**: Returns generated content or documents

## **Success Indicators:**

- ✅ No console errors
- ✅ "Start Creating Documents" button is enabled
- ✅ Can create new sessions
- ✅ Can send messages in chat
- ✅ AI responds with content

## **Contact Information:**

If issues persist:
1. Check browser console for specific error messages
2. Check Django server logs
3. Verify both servers are running on correct ports
4. Test API endpoints manually with curl/Postman

The frontend is now configured to work seamlessly with the Django backend with automatic authentication for demo purposes.
