# Khat - Setup Checklist ✅

Use this checklist to complete your Khat setup. Check off each item as you complete it.

## Phase 1: Firebase Setup (Required)

- [ ] **Create Firebase Project**
  - Go to https://console.firebase.google.com
  - Click "Create Project"
  - Name: "khat"
  - No analytics needed for MVP

- [ ] **Enable Authentication**
  - In Firebase console → Authentication
  - Click "Get Started"
  - Enable "Email/Password" provider
  - Click "Save"

- [ ] **Create Firestore Database**
  - In Firebase console → Firestore Database
  - Click "Create Database"
  - Start in "Production mode"
  - Choose region (pick closest to you)
  - Click "Create"

- [ ] **Enable Cloud Storage**
  - In Firebase console → Storage
  - Click "Get Started"
  - Select default bucket
  - Click "Done"

- [ ] **Get Firebase Config**
  - In Firebase console → Project Settings
  - Copy all values from "Web" config
  - Keep these values visible

- [ ] **Create .env.local**
  - Copy `.env.example` to `.env.local`
  - Add Firebase config values:
    - VITE_FIREBASE_API_KEY
    - VITE_FIREBASE_AUTH_DOMAIN
    - VITE_FIREBASE_PROJECT_ID
    - VITE_FIREBASE_STORAGE_BUCKET
    - VITE_FIREBASE_MESSAGING_SENDER_ID
    - VITE_FIREBASE_APP_ID

- [ ] **Verify Firebase Connection**
  - Save `.env.local`
  - Run `npm run dev`
  - Open browser console
  - No Firebase errors should appear

## Phase 2: Test Admin Dashboard

- [ ] **Login to Admin**
  - Go to http://localhost:5173/admin
  - Email: `admin@khat.com`
  - Password: (any password - Firebase will reject if user doesn't exist)
  - You should see error (expected - user not created yet)

- [ ] **Create Admin User in Firebase**
  - In Firebase console → Authentication
  - Click "Add User" (or "Create user")
  - Email: `admin@khat.com`
  - Password: (choose a strong password)
  - Click "Add user"

- [ ] **Login Again**
  - Go back to http://localhost:5173/admin
  - Enter `admin@khat.com` + password
  - Should see Admin Dashboard with 0 stats

- [ ] **Create First Product**
  - Click "Products" in sidebar
  - Click "+ Add Product"
  - Fill in:
    - Name: "Test T-Shirt"
    - Category: "T-Shirts"
    - Price: "29.99"
    - Stock: "50"
  - Click "Add Product"
  - Should see product in table

## Phase 3: Test Customer Site

- [ ] **View Shop**
  - Go to http://localhost:5173/shop
  - Should see your test product in grid

- [ ] **View Product Detail**
  - Click on test product
  - Should see full product details
  - Should show "In Stock (50)"
  - Should have "Add to Cart" button

- [ ] **Test Navigation**
  - Click "KHAT" logo → goes to home
  - Click "Shop" → goes to shop
  - Click "Cart" → empty cart page
  - All navbar links working

- [ ] **Add Second Product**
  - Go back to admin
  - Add another product: "Coffee Mug"
  - Go to shop → should see both products

## Phase 4: Optional - Cloudinary Setup

- [ ] **Create Cloudinary Account** (Optional for MVP)
  - Go to https://cloudinary.com/users/register/free
  - Sign up with email
  - Verify email
  - Get your cloud name from dashboard

- [ ] **Create Upload Preset**
  - In Cloudinary → Settings → Upload
  - Scroll to "Upload presets"
  - Create unsigned upload preset
  - Name: "khat-products"
  - Enable "unsigned" mode

- [ ] **Add to .env.local**
  - VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
  - VITE_CLOUDINARY_UPLOAD_PRESET=khat-products

## Phase 5: Git Setup

- [ ] **Initialize Git** (if not already done)
  ```bash
  git init
  git add .
  git commit -m "Initial Khat project scaffold"
  ```

- [ ] **Create GitHub Repository** (Optional for MVP)
  - Go to https://github.com/new
  - Create repo "khat"
  - Push local repo to GitHub

- [ ] **Add .gitignore Rules**
  - Check `.gitignore` has `node_modules/`
  - Check `.gitignore` has `.env.local`
  - Check `.gitignore` has `dist/`

## Phase 6: Development Ready

- [ ] **Install Dependencies**
  - Run `npm install` (should already be done)
  - Run `npm audit fix` (to fix vulnerabilities)

- [ ] **Start Dev Server**
  - Run `npm run dev`
  - Open http://localhost:5173
  - Server should start without errors

- [ ] **Read Documentation**
  - Read `QUICK_START.md` (5 min)
  - Read `CLAUDE.md` for guidelines (10 min)
  - Bookmark `ARCHITECTURE.md` for reference

- [ ] **Test Hot Reload**
  - Edit `src/pages/customer/HomePage.jsx`
  - Change "Welcome to Khat" to something else
  - Save file
  - Browser should refresh automatically
  - Revert change when done

- [ ] **Test Console Logging**
  - Open browser DevTools (F12)
  - Go to Admin Dashboard
  - Check Console tab for any warnings/errors
  - Should be clean

## Phase 7: Ready to Build

Congratulations! Your project is set up. Now you can start building:

### Immediate Next Steps (This Week)

- [ ] **Implement Shopping Cart**
  - Create Cart context or state
  - Save cart to localStorage
  - Update CartPage component
  - Show cart item count in navbar

- [ ] **Add Customer Auth Pages**
  - Create `/signup` page
  - Create `/login` page
  - Integrate with Firebase Auth
  - Add signup/login to navbar

- [ ] **Build Checkout Flow**
  - Create checkout form (shipping address)
  - Integrate with orderService
  - Create orders in Firestore
  - Show order confirmation

### Following Week

- [ ] Order tracking & status updates
- [ ] Customer dashboard order history
- [ ] Search & filter products
- [ ] Mobile optimization

## 🆘 Troubleshooting

**Dev server won't start:**
- Check `.env.local` has all Firebase vars
- Run `npm install` again
- Delete `node_modules` and reinstall
- Check Node version (need 16+): `node --version`

**Admin login not working:**
- Verify user created in Firebase console
- Double-check email matches exactly: `admin@khat.com`
- Check Firebase Auth is enabled in console
- Look at browser console for specific error

**Products not showing in shop:**
- Go to admin dashboard first
- Add a product via admin form
- Check Firestore console for "products" collection
- Refresh shop page

**Styles look broken:**
- Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check `src/styles/variables.css` loaded
- Check no CSS errors in DevTools

**Firebase not connecting:**
- Verify all `.env.local` variables
- Check Firebase project has Firestore & Auth enabled
- Try: Delete `node_modules/.vite` folder and restart

## 📊 Success Criteria

You're done with setup when you can:

✅ Access admin dashboard without errors
✅ Add a product from admin
✅ See product in shop page
✅ View product details
✅ No console errors
✅ Navbar works on all pages
✅ Responsive on mobile

## 📝 Notes

- **Save `.env.local`** - Never commit this to git!
- **Restart dev server** after changing `.env.local`
- **Test frequently** - Don't wait till end to test
- **Check console** - DevTools console shows all errors

## 🎉 Setup Complete!

Once you've checked all boxes:

1. **Read** `QUICK_START.md` for quick reference
2. **Reference** `CLAUDE.md` for development guidelines
3. **Start coding** your next features!

---

**Time to complete:** ~30-45 minutes
**Difficulty:** Easy (mostly clicking & copying)
**Support:** Check docs in order: QUICK_START → CLAUDE.md → ARCHITECTURE.md

Good luck! 🚀
