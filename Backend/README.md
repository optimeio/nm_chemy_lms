# SriTech Backend

This backend is a production-ready Node.js + Express + MongoDB API for the SriTech e-commerce site.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in MongoDB, JWT, Razorpay, Cloudinary, and email values.
3. Install dependencies:

```bash
cd Backend
npm install
```

4. Start in development mode:

```bash
npm run dev
```

## API Endpoints

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/verify-otp`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/admin/login`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/products/:productId/reviews`
- `POST /api/products/:productId/reviews`
- `DELETE /api/products/:productId/reviews/:reviewId`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id`
- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `GET /api/offers`
- `POST /api/offers`
- `GET /api/support`
- `POST /api/support`
- `POST /api/support/:id/respond`
- `POST /api/subscribers`
- `GET /api/subscribers`
- `DELETE /api/subscribers/:id`
- `POST /api/leads`
- `GET /api/leads`
- `GET /api/coupons`
- `POST /api/coupons`
- `PATCH /api/coupons/:id`
- `DELETE /api/coupons/:id`
- `GET /api/hero-banners`
- `POST /api/hero-banners`
- `DELETE /api/hero-banners/:id`
- `GET /api/logs`
- `GET /api/docs`

## Notes

- All user actions are secured with JWT where needed.
- Admin login generates a token with admin role.
- Passwords are hashed with bcrypt.
- Email workflows use Nodemailer.
- Payment integration is powered by Razorpay.
