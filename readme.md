# E-Commerce API

A robust e-commerce API built with Node.js, Express, and MongoDB.

## Features

1. User authentication and authorization
2. Product management
3. Category management
4. Shopping cart functionality
5. Order processing
6. Review system
7. Search and filter capabilities

## Prerequisites

1. Node.js (v14 or higher)
2. MongoDB
3. npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd e-commerce
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the server:
```bash
npm start
```

The server will start running on `http://localhost:3000`

## API Routes

### Authentication & User Routes
1. `POST /api/register` - Register a new user
2. `POST /api/login` - Login user
3. `GET /api/users` - Get all users (admin only)
4. `GET /api/users/:id` - Get user by ID (protected route)
5. `GET /api/users/:id/address` - Get user's address (protected route)
6. `PUT /api/users/:id` - Update user details (protected route)
7. `PUT /api/users/:id/role` - Update user role (protected route)
8. `DELETE /api/users/:id` - Delete user (admin only)

### Product Routes
1. `GET /api/products` - Get all products
2. `GET /api/products/:id` - Get product by ID
3. `POST /api/products` - Create new product (admin only)
4. `PUT /api/products/:id` - Update product (admin only)
5. `DELETE /api/products/:id` - Delete product (admin only)
6. `GET /api/products/brand/:brandName` - Get products by brand name
7. `PUT /api/products/:id/stock` - Update product stock (admin only)
8. `GET /api/products/category/:categoryId` - Get products by category

### Category Routes
1. `GET /api/categories` - Get all categories
2. `GET /api/categories/:id` - Get category by ID
3. `POST /api/categories` - Create new category (protected route)
4. `PUT /api/categories/:id` - Update category (protected route)
5. `DELETE /api/categories/:id` - Delete category (protected route)

### Cart Routes
1. `GET /api/cart` - Get user's cart
2. `POST /api/cart/add` - Add item to cart
3. `DELETE /api/cart/remove/:productId` - Remove item from cart
4. `PUT /api/cart/update/:productId` - Update cart item quantity
5. `DELETE /api/cart/clear` - Clear cart
6. `PUT /api/cart/total/:userId` - Manually update cart total (admin only)

### Order Routes
1. `POST /api/orders` - Place a new order
2. `GET /api/orders` - Get all orders (admin only)
3. `GET /api/orders/user/:userId` - Get user's order history
4. `GET /api/orders/:orderId` - Get order by ID
5. `PUT /api/orders/:orderId/status` - Update order status (admin only)
6. `PUT /api/orders/:orderId` - Cancel order
7. `PUT /api/orders/:orderId/address` - Update shipping address
8. `GET /api/orders/:orderId/track` - Track order status

### Review Routes
1. `POST /api/reviews` - Add a review
2. `GET /api/reviews/product/:productId` - Get reviews for a product
3. `GET /api/reviews/user/:userId` - Get reviews by a user
4. `PUT /api/reviews/:reviewId` - Edit a review
5. `DELETE /api/reviews/:reviewId` - Delete a review

### Search and Filter Routes
1. `GET /api/search` - Search products by keyword (searches in name and description)
2. `GET /api/products/sort/:type` - Sort products by specified field (e.g., price, name)
3. `GET /api/products/low-stock` - Get products with stock less than 10 (admin only)
4. `GET /api/stats/dashboard` - Get dashboard statistics including total products, orders, low stock count, and revenue (admin only)
5. `GET /api/user/:id/purchase-history` - Get user's purchase history (protected route)

## Technologies Used

1. Node.js
2. Express.js
3. MongoDB
4. Mongoose
5. JWT for authentication
6. bcrypt for password hashing

## Project Structure

```
e-commerce/
├── models/         # Database models
├── routes/         # API routes
├── middlewares/    # Custom middlewares
├── server.js       # Main application file
├── .env           # Environment variables
└── package.json   # Project dependencies
```
