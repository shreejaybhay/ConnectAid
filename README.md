# ConnectAid - Community Platform with Complete Authentication System

A comprehensive community platform built with Next.js 15, featuring a complete authentication system with NextAuth.js, MongoDB, email verification, role-based access control, and admin approval workflows.

## 🚀 Features

### Authentication System
- **NextAuth.js with Credentials Provider** - Secure email/password authentication
- **Email Verification** - Required for all users before login
- **Role-Based Access Control** - Three roles: `admin`, `volunteer`, `citizen`
- **Admin Approval Workflow** - Volunteers require admin approval before login
- **Password Reset** - Secure password reset via email links
- **Account Management** - Users can update profile and change passwords
- **Account Deletion** - Users can delete their accounts from settings

### User Roles & Permissions
- **Admin** (`shreejaybhay26@gmail.com`)
  - Hardcoded admin user
  - Access to admin dashboard
  - Can approve/reject volunteer applications
  - Full platform management access

- **Volunteer**
  - Must verify email after registration
  - Requires admin approval before login
  - Access to volunteer features once approved

- **Citizen**
  - Must verify email after registration
  - Auto-approved (no admin approval needed)
  - Access to community features once verified

### Security Features
- **JWT Session Strategy** - Secure session management
- **Password Hashing** - bcryptjs with salt rounds
- **Route Protection** - Middleware-based route protection
- **Email Verification Tokens** - Secure token-based email verification
- **Password Reset Tokens** - Time-limited password reset tokens
- **Form Validation** - Zod schema validation with react-hook-form

### User Experience
- **Toast Notifications** - Real-time feedback for all operations
- **Loading States** - Visual feedback during async operations
- **Error Handling** - Comprehensive error handling and user feedback
- **Responsive Design** - Mobile-first responsive design
- **Smooth Animations** - Framer Motion animations throughout

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion
- **Authentication**: NextAuth.js v5 (beta)
- **Database**: MongoDB with Mongoose ODM
- **Email**: Nodemailer with SMTP
- **Validation**: Zod + React Hook Form
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS with custom design system

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- SMTP email service (Gmail, SendGrid, etc.)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd civic
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/civic-app

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production

# Admin Configuration
ADMIN_EMAIL=shreejaybhay26@gmail.com

# Email Configuration (Gmail example)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# App Configuration
APP_NAME=ConnectAid
APP_URL=http://localhost:3000
```

### 4. Database Setup

Make sure MongoDB is running locally or update `MONGODB_URI` to point to your MongoDB instance.

### 5. Email Configuration

For Gmail SMTP:
1. Enable 2-factor authentication on your Google account
2. Generate an App Password for your application
3. Use the App Password in `EMAIL_SERVER_PASSWORD`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing the Authentication Flow

### 1. Admin Setup
The admin user is hardcoded with email `shreejaybhay26@gmail.com`. To test admin features:
1. Register with the admin email
2. Verify email through the verification link
3. Login to access admin dashboard at `/admin/dashboard`

### 2. Citizen Registration & Login
1. Go to `/register`
2. Fill out the form and select "Get Help" (citizen role)
3. Submit the form
4. Check email for verification link
5. Click verification link
6. Login at `/login`
7. Access dashboard at `/dashboard`

### 3. Volunteer Registration & Approval
1. Go to `/register`
2. Fill out the form and select "Volunteer"
3. Submit the form
4. Check email for verification link
5. Click verification link
6. Try to login - should show "pending approval" message
7. Login as admin and go to `/admin/volunteers`
8. Approve the volunteer application
9. Volunteer can now login and access dashboard

### 4. Password Reset Flow
1. Go to `/forgot-password`
2. Enter email address
3. Check email for reset link
4. Click reset link to go to `/reset-password`
5. Enter new password
6. Login with new password

### 5. Account Management
1. Login and go to `/dashboard/settings`
2. Test profile updates
3. Test password change
4. Test account deletion

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── admin/                # Admin-only endpoints
│   │   └── user/                 # User management endpoints
│   ├── admin/                    # Admin dashboard pages
│   ├── dashboard/                # User dashboard pages
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── forgot-password/          # Forgot password page
│   └── reset-password/           # Reset password page
├── components/                   # React components
│   ├── ui/                       # UI components
│   └── providers/                # Context providers
├── lib/                          # Utility libraries
│   ├── auth.js                   # NextAuth configuration
│   ├── mongodb.js                # Database connection
│   ├── email.js                  # Email service
│   └── validations.js            # Zod schemas
├── models/                       # Mongoose models
│   ├── User.js                   # User model
│   └── VerificationToken.js      # Token model
├── hooks/                        # Custom React hooks
└── middleware.js                 # Route protection middleware
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-email` - Email verification
- `GET /api/auth/verify-email?token=` - Email verification via URL
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/reset-password?token=` - Verify reset token

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `DELETE /api/user/profile` - Delete user account
- `POST /api/user/change-password` - Change password

### Admin
- `GET /api/admin/volunteers` - Get pending volunteers
- `POST /api/admin/volunteers` - Approve/reject volunteers

## 🎨 UI Components

The application uses a custom design system built with:
- **Tailwind CSS** for styling
- **Radix UI** for accessible primitives
- **Framer Motion** for animations
- **Custom color palette** with orange/yellow primary colors
- **Responsive design** with mobile-first approach

## 🔒 Security Considerations

- Passwords are hashed with bcryptjs (12 salt rounds)
- JWT tokens are signed and verified
- Email verification prevents unauthorized access
- Rate limiting should be implemented for production
- HTTPS should be used in production
- Environment variables should be properly secured

## 🚀 Deployment

### Environment Variables for Production
Make sure to set all environment variables in your production environment:
- Use a strong `NEXTAUTH_SECRET`
- Update `NEXTAUTH_URL` to your production URL
- Use a production MongoDB instance
- Configure production email service
- Update `APP_URL` to your production domain

### Recommended Platforms
- **Vercel** - Seamless Next.js deployment
- **Netlify** - Alternative deployment platform
- **Railway** - Full-stack deployment with database
- **DigitalOcean App Platform** - Scalable deployment

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the repository.
