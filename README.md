# Khat - Print on Demand Brand Website

A modern, modular print-on-demand e-commerce platform built with Vite, React, Firebase, and Cloudinary.

## 🎨 Color Palette

- **Primary Charcoal**: #333333
- **Accent Pale Blue**: #A9C5D3
- **Support Latte**: #B88A6A
- **Background Cream**: #F3E9DC
- **Text Warm Brown**: #5D514A

## 📁 Project Structure

```
src/
├── assets/              # Images, logos, static files
├── components/          # Reusable React components
│   ├── layout/         # Layout components (CustomerLayout, AdminLayout)
│   └── styles/         # Component-specific stylesheets
├── pages/              # Page components
│   ├── customer/       # Customer-facing pages
│   ├── admin/          # Admin dashboard pages
│   └── styles/         # Page stylesheets
├── services/           # API and Firebase services
│   ├── firebase.js     # Firebase initialization
│   ├── api.js          # Axios API client
│   ├── productService.js  # Product CRUD operations
│   └── orderService.js    # Order management
├── styles/             # Global styles and variables
│   ├── global.css      # Global styles
│   └── variables.css   # CSS custom properties
├── utils/              # Utility functions
│   ├── constants.js    # App constants
│   └── helpers.js      # Helper functions
├── App.jsx             # Main app component with routing
└── main.jsx            # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase account
- Cloudinary account (for image storage)

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Create `.env.local` file** (copy from `.env.example`)
```bash
cp .env.example .env.local
```

3. **Configure Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Get your config values and add them to `.env.local`
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Enable Cloud Storage

4. **Set up Cloudinary**
   - Go to [Cloudinary Dashboard](https://cloudinary.com/console)
   - Add your cloud name and upload preset to `.env.local`

5. **Configure Brevo order emails**
  - In Brevo, verify `khat.eg111@gmail.com` as a sender with the display name `Khat`.
  - Create a Brevo API key and add it to the Vercel project as `BREVO_API_KEY`.
  - Add `BREVO_SENDER_EMAIL=khat.eg111@gmail.com`, `BREVO_SENDER_NAME=Khat`, and `ORDER_NOTIFICATION_EMAIL=khat.eg111@gmail.com` to Vercel.
  - Redeploy after saving the variables. Never add `BREVO_API_KEY` to a `VITE_` variable or commit it.

6. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:5173`

## 🏗️ Architecture

### Customer Side
- **HomePage**: Hero section with features
- **ShopPage**: Browse all products
- **ProductDetailPage**: View single product with add to cart
- **CartPage**: Manage shopping cart
- **CheckoutPage**: Complete order with COD payment
- **CustomerDashboard**: View orders and account info

### Admin Side (Admin email: `admin@khat.com`)
- **AdminLogin**: Authentication for admins
- **AdminDashboard**: Overview with stats
- **AdminProducts**: Add/Edit/Delete products
- **AdminOrders**: Manage order statuses
- **AdminCustomers**: View customer data
- **AdminInventory**: Track and update stock

## 🗄️ Firebase Collections

### `products`
```javascript
{
  id: "product-id",
  name: "Product Name",
  description: "Product description",
  category: "T-Shirts",
  price: 29.99,
  stock: 100,
  imageUrl: "cloudinary-url",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `orders`
```javascript
{
  id: "order-id",
  userId: "firebase-user-id",
  customerEmail: "customer@example.com",
  items: [
    { productId, name, price, quantity }
  ],
  total: 99.99,
  status: "pending", // pending, confirmed, shipped, delivered, cancelled
  shippingAddress: {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "USA"
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🔐 Authentication

- **Customer**: Email/Password via Firebase Auth
- **Admin**: Email verification against `admin@khat.com` in `.env.local`

## 💳 Payment

Currently set up for **Cash on Delivery (COD)**. To integrate other payment methods:
1. Implement payment gateway (Stripe, PayPal, etc.)
2. Update checkout flow
3. Add payment status to orders

## 🖼️ Image Management

All product images are stored in **Cloudinary** and linked via URLs in the database. To upload images:
1. Use Cloudinary widget or API
2. Store returned URL in product imageUrl field

## 📦 Services

### Firebase Service (`src/services/firebase.js`)
Initializes Firebase app, auth, Firestore, and Storage.

### Product Service (`src/services/productService.js`)
- `getAllProducts()` - Fetch all products
- `getProduct(id)` - Get single product
- `addProduct(data)` - Create new product
- `updateProduct(id, data)` - Update product
- `deleteProduct(id)` - Delete product
- `getProductsByCategory(category)` - Filter by category

### Order Service (`src/services/orderService.js`)
- `getAllOrders()` - Get all orders (admin)
- `getUserOrders(userId)` - Get user's orders
- `getOrder(id)` - Get single order
- `createOrder(data)` - Create new order
- `updateOrderStatus(id, status)` - Update order status
- `updateOrder(id, data)` - Update order details

## 🎯 Key Features (Ready to Implement)

- [ ] Shopping cart management (Context/State)
- [ ] Product filtering & search
- [ ] User authentication flow
- [ ] Checkout form with shipping address
- [ ] Order tracking system
- [ ] Email notifications
- [ ] Admin analytics
- [ ] Product reviews & ratings
- [ ] Wishlist functionality
- [ ] Responsive mobile design

## 🔗 Environment Variables

See `.env.example` for all required variables.

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Code Style
- Use functional components with hooks
- Modular folder structure
- Separate concerns (services, components, pages)
- CSS in separate files per component/page

## 📝 Notes

- Admin email verification is hardcoded; consider using Firebase custom claims in production
- Product images should be optimized before uploading to Cloudinary
- Set up Firestore security rules before going live
- Configure CORS for API calls if using external backend

## 🚀 Deployment

### Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## 📧 Support

For issues or feature requests, create an issue in the repository.

## 📄 License

MIT
