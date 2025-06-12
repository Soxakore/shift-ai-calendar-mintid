# Setting Up Your Admin Credentials

## 🔧 **STEP-BY-STEP SETUP**

### **Step 1: Edit the Environment File**

Open the file `/Users/ibe/Documents/WorkFlowAi/.env` and replace the placeholder values:

```env
# Admin Credentials
VITE_ADMIN_EMAIL=your-actual-email@company.com
VITE_ADMIN_PASSWORD=your-secure-password
VITE_ADMIN_NAME=Your Full Name
```

**Example:**
```env
# Admin Credentials
VITE_ADMIN_EMAIL=john.admin@mycompany.com
VITE_ADMIN_PASSWORD=MySecurePassword123!
VITE_ADMIN_NAME=John Administrator
```

### **Step 2: Restart the Development Server**

The server needs to restart to pick up the new environment variables:

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart with:
npm run dev
```

### **Step 3: Test Your Admin Login**

1. Navigate to: http://localhost:8082/admin/login
2. Enter your credentials from the `.env` file
3. Click "Sign In as Admin"

---

## 🔐 **CURRENT SETUP**

**Server URL:** http://localhost:8082 (updated port)

**Default Credentials (if .env not set):**
- Email: `admin@workflow.com`
- Password: `admin123`

**Your Custom Credentials:**
- Email: Whatever you set in `VITE_ADMIN_EMAIL`
- Password: Whatever you set in `VITE_ADMIN_PASSWORD`
- Name: Whatever you set in `VITE_ADMIN_NAME`

---

## 🛡️ **SECURITY NOTES**

✅ **Environment variables are:**
- Not committed to Git (added to .gitignore)
- Only accessible to you locally
- Can be different for each environment (dev/prod)

✅ **The `.env` file:**
- Contains your sensitive credentials
- Is ignored by Git for security
- Should be backed up separately

---

## 🚀 **QUICK START**

1. **Edit `.env` file** with your preferred admin credentials
2. **Restart the server** (it's already running on port 8082)
3. **Login at:** http://localhost:8082/admin/login

That's it! Your admin account is now personalized with your own credentials.
