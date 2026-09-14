# 🛍️ Forever — Full-Stack E-Commerce Website

Forever is a full-stack e-commerce web application that provides a complete online shopping experience, including user authentication, product browsing, cart management, order placement, online payments, and an admin dashboard.

This project was built to gain hands-on experience in developing and connecting the frontend, backend, database, authentication, order management, and payment systems of a real-world web application.

---

## 🚀 Features

### 👤 User Features

- User registration and login
- JWT-based authentication
- Browse products and collections
- Product filtering and sorting
- Product details with size selection
- Add products to cart
- Update product quantities
- Remove products from cart
- Checkout and delivery information
- Cash on Delivery
- Stripe payment integration
- Razorpay payment integration
- View placed orders
- Check order status

### 🔐 Admin Features

- Admin authentication
- Add new products
- View and manage products
- Delete products
- View customer orders
- Update order status
- Manage the overall store

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Tailwind CSS
- React Router
- Axios
- React Toastify

### Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt
- Multer

### Database

- MongoDB
- Mongoose

### Payment Integration

- Stripe
- Razorpay

---

## 🏗️ Project Architecture

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │   React + Tailwind  │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │       Backend       │
                    │ Node.js + Express   │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
             ┌─────────────┐       ┌─────────────┐
             │   MongoDB   │       │   Payments  │
             │  Database   │       │ Stripe /    │
             │             │       │ Razorpay    │
             └─────────────┘       └─────────────┘