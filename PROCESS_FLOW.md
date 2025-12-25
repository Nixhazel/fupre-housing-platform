# FUPRE Student Housing Platform - Complete Process Flow Guide

This document provides a comprehensive step-by-step guide of all features and user flows for each user type in the FUPRE Student Housing Platform.

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Platform Overview](#platform-overview)
3. [User Types & Roles](#user-types--roles)
4. [Public User Flow (Unauthenticated)](#public-user-flow-unauthenticated)
5. [Student User Flow](#student-user-flow)
6. [Student Agent (ISA) Flow](#student-agent-isa-flow)
7. [Property Owner Flow](#property-owner-flow)
8. [Admin Flow](#admin-flow)
9. [Common Features](#common-features)
10. [Technical Notes](#technical-notes)

---

## Initial Setup

### Prerequisites

1. **Node.js** v18 or higher
2. **MongoDB** database (local or MongoDB Atlas)
3. **Cloudinary** account for image uploads
4. **Email service** (Gmail or other SMTP)

### Environment Variables

Create a `.env.local` file in the project root with:

```env
# Database
MONGODB_URI=mongodb+srv://your-connection-string

# JWT Secrets
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=FUPRE Housing <your-email@gmail.com>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Custom Admin Credentials
ADMIN_EMAIL=admin@fuprehousing.com
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=Platform Admin
```

### Seed Admin User

Before using the platform, you need to create an admin user:

```bash
npm run seed:admin
```

This will create an admin user with the following default credentials:

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | admin@fuprehousing.com |
| Password | Admin@123456           |
| Name     | Platform Admin         |

**⚠️ IMPORTANT:** Change these credentials after first login!

### Start the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

---

## Platform Overview

The FUPRE Student Housing Platform is a web application designed to help students of the Federal University of Petroleum Resources, Effurun (FUPRE) find quality accommodation near campus. It connects students with verified student agents who list properties, and also provides roommate matching functionality.

**Key Features:**

- Property listings with location unlock payment system
- Roommate matching for students and property owners
- Student agent verification and earnings tracking
- Admin dashboard for platform management

---

## User Types & Roles

| Role                    | Description                                            | Key Capabilities                                                                            |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| **Student**             | Regular student looking for accommodation or roommates | Browse listings, save favorites, unlock locations, find roommates, create roommate listings |
| **Student Agent (ISA)** | Student who lists properties on behalf of landlords    | All student features + create/manage property listings, track earnings                      |
| **Property Owner**      | Person who owns property and wants to find roommates   | All student features + create roommate listings to find tenants                             |
| **Admin**               | Platform administrator                                 | All features + manage users, approve payment proofs, view platform stats                    |

---

## Public User Flow (Unauthenticated)

### What Public Users Can Do

```
1. HOME PAGE (/)
   ├── View platform introduction and statistics
   ├── Search for listings (redirects to listings page)
   ├── Browse featured listings (limited view)
   └── Access navigation to:
       ├── Listings page
       ├── Roommates page
       ├── Login/Register pages
       └── Help page

2. LISTINGS PAGE (/listings)
   ├── View all available listings
   ├── Search by location, price, amenities
   ├── Filter by:
   │   ├── Price range
   │   ├── Bedrooms/Bathrooms
   │   ├── Campus areas (Ugbomro, Effurun, Enerhen, PTI Road, Other)
   │   ├── Amenities
   │   └── Sort order
   ├── Toggle grid/list view
   └── Click to view listing details

3. LISTING DETAIL PAGE (/listings/[id])
   ├── View listing photos, description, amenities
   ├── See approximate location (blurred map)
   ├── View agent info (limited)
   ├── Share listing
   └── Prompted to login for:
       ├── Saving to favorites
       ├── Unlocking location details
       └── Contacting agent

4. ROOMMATES PAGE (/roommates)
   ├── Browse roommate listings
   ├── Two tabs:
   │   ├── "Find a Roommate" - Students seeking roommates
   │   └── "I'm an Owner" - Property owners with rooms available
   ├── Filter by budget, gender preference
   └── Prompted to login for:
       ├── Saving favorites
       ├── Creating roommate listing
       └── Contacting roommate seekers

5. HELP PAGE (/help)
   ├── FAQ section
   ├── Contact information
   │   ├── Email: fuprehousing@gmail.com
   │   ├── Phone: +234 123 456 7890
   │   └── WhatsApp link
   └── Quick action buttons
```

### Registration Process

```
REGISTER (/auth/register)
│
├── Step 1: Fill Registration Form
│   ├── Full Name (required)
│   ├── Email (required)
│   ├── Phone Number (+234XXXXXXXXXX format)
│   ├── Account Type (Student / Student Agent / Property Owner)
│   ├── Password (min 6 characters)
│   └── Confirm Password
│
├── Step 2: Submit Form
│   └── Validation checks performed
│
├── Step 3: Email Verification
│   ├── Verification email sent automatically
│   ├── Redirect to /auth/verify-email
│   ├── User checks email inbox (+ spam)
│   └── Click verification link
│
├── Step 4: Verification Complete
│   ├── Account activated
│   ├── Can login to platform
│   └── Full features unlocked based on role
│
└── Alternative: Continue without verification
    └── Limited features until verified
```

### Login Process

```
LOGIN (/auth/login)
│
├── Enter Credentials
│   ├── Email
│   └── Password
│
├── Successful Login
│   ├── JWT tokens set (access + refresh)
│   ├── Redirect based on role:
│   │   ├── Admin → /dashboard/admin
│   │   ├── Agent → /dashboard/agent
│   │   └── Student/Owner → / (home)
│   └── Show email verification banner if not verified
│
└── Failed Login
    └── Error message displayed
```

### Password Reset Process

```
FORGOT PASSWORD (/auth/forgot-password)
│
├── Step 1: Enter Email
│   └── Submit email address
│
├── Step 2: Check Email
│   └── Password reset link sent (valid 1 hour)
│
├── Step 3: Reset Password (/auth/reset-password?token=xxx)
│   ├── Enter new password
│   └── Confirm new password
│
└── Step 4: Success
    └── Redirect to login page
```

---

## Student User Flow

### After Login: Student Dashboard

```
STUDENT FEATURES
│
├── HOME PAGE (/)
│   ├── View featured listings
│   ├── Quick search functionality
│   └── Navigate to all sections
│
├── BROWSE LISTINGS (/listings)
│   ├── Search and filter listings
│   ├── Save favorites (❤️ icon)
│   ├── View listing details
│   └── See saved listings (/listings?saved=true)
│
├── VIEW LISTING DETAIL (/listings/[id])
│   ├── Full property information
│   ├── Photo gallery
│   ├── Property details (beds, baths, distance)
│   ├── Amenities list
│   ├── Agent information
│   ├── Save/unsave listing
│   ├── Share listing
│   └── UNLOCK LOCATION (requires payment)
│
├── UNLOCK LOCATION FLOW (/unlock/[id])
│   ├── Step 1: View listing preview
│   ├── Step 2: Choose payment method
│   │   ├── Bank Transfer
│   │   ├── USSD
│   │   └── POS
│   ├── Step 3: Make payment (₦1,000)
│   ├── Step 4: Upload payment receipt (Cloudinary)
│   ├── Step 5: Enter transaction reference
│   ├── Step 6: Submit for review
│   └── Step 7: Wait for admin approval
│       ├── On approval: Full address + contact revealed
│       └── On rejection: Notified with reason
│
├── BROWSE ROOMMATES (/roommates)
│   ├── View roommate listings
│   ├── Filter by budget, gender
│   ├── Save favorites
│   └── View roommate details
│
├── VIEW ROOMMATE DETAIL (/roommates/[id])
│   ├── Full roommate listing info
│   ├── Photos
│   ├── Budget and move-in date
│   ├── Preferences (gender, cleanliness, study hours, etc.)
│   ├── Owner/poster information
│   ├── VIEW CONTACT INFO (free, requires login)
│   │   ├── Email (with copy button)
│   │   └── Phone (with copy button)
│   └── Save/share listing
│
├── CREATE ROOMMATE LISTING (/roommates/new)
│   ├── Title
│   ├── Description
│   ├── Monthly budget
│   ├── Move-in date
│   ├── Preferences:
│   │   ├── Gender preference (male/female/any)
│   │   ├── Cleanliness level
│   │   ├── Study hours preference
│   │   ├── Smoking policy
│   │   └── Pets policy
│   ├── Upload photos (Cloudinary)
│   └── Submit listing
│
├── SAVED ROOMMATES (/dashboard/student/saved-roommates)
│   ├── View all saved roommate listings
│   ├── Search saved listings
│   ├── Remove from saved
│   └── Quick access to listing details
│
├── PROFILE PAGE (/profile)
│   ├── View personal information
│   │   ├── Name, Email, Phone
│   │   ├── Matric Number
│   │   ├── Role badge
│   │   └── Verification status
│   ├── Edit profile (name, phone)
│   ├── View stats:
│   │   ├── Saved listings count
│   │   ├── Unlocked listings count
│   │   └── Payment proofs count
│   └── Quick actions:
│       ├── Create roommate listing
│       └── View saved listings
│
└── LOGOUT
    ├── Clears session
    └── Redirect to home
```

---

## Student Agent (ISA) Flow

Student Agents have all Student features PLUS the ability to create and manage property listings.

### Agent Dashboard

```
AGENT DASHBOARD (/dashboard/agent)
│
├── Overview
│   ├── Total Listings count
│   ├── Total Views
│   ├── Total Earnings (₦)
│   └── Total Unlocks
│
├── Quick Actions
│   ├── Create New Listing
│   ├── Manage Listings
│   ├── View Earnings
│   └── Update Profile
│
└── Recent Listings
    └── Last 5 listings with stats
```

### Agent Listings Management

```
MANAGE LISTINGS (/dashboard/agent/listings)
│
├── View All Agent Listings
│   ├── Grid view with listing cards
│   ├── Search by title/area
│   ├── Filter by status (all/available/taken)
│   └── Each listing shows:
│       ├── Cover photo
│       ├── Title
│       ├── Campus area
│       ├── Price
│       ├── Status badge
│       └── View count
│
├── Listing Actions (dropdown menu)
│   ├── View listing
│   ├── Edit listing
│   ├── Mark as Taken / Mark as Available
│   └── Delete listing
│
└── CREATE NEW LISTING (/dashboard/agent/listings/new)
    ├── Basic Information
    │   ├── Title
    │   ├── Description
    │   ├── Campus Area
    │   ├── Full Address (hidden until unlocked)
    │   └── Approximate Address (shown publicly)
    ├── Property Details
    │   ├── Price per month
    │   ├── Bedrooms
    │   ├── Bathrooms
    │   └── Distance to campus
    ├── Amenities (multi-select)
    │   ├── Wi-Fi, Water, 24/7 Power
    │   ├── Security, Furnished, AC
    │   ├── Kitchenette, Wardrobe
    │   └── Proximity to shuttle, Garden
    ├── Photos (Cloudinary upload)
    │   ├── Cover photo
    │   └── Gallery photos
    ├── Map Images
    │   ├── Preview map (blurred)
    │   └── Full map (shown after unlock)
    └── Submit listing
```

### Agent Earnings

```
EARNINGS DASHBOARD (/dashboard/agent/earnings)
│
├── Period Selector
│   ├── Last 3 Months
│   ├── Last 6 Months
│   └── Last Year
│
├── Stats Overview
│   ├── Total Earnings (with growth %)
│   ├── Total Views
│   ├── Location Unlocks (₦1,000 each)
│   └── Conversion Rate (views → unlocks)
│
├── Monthly Earnings Breakdown
│   └── Month-by-month listing with unlocks and amount
│
├── Top Performing Listings
│   └── Top 5 listings by views
│
└── EXPORT REPORT
    ├── Export as PDF
    │   └── Generates printable PDF with all data
    └── Export as CSV
        └── Downloads spreadsheet file
```

### Agent Profile

```
AGENT PROFILE (/dashboard/agent/profile)
│
├── Profile Card
│   ├── Avatar
│   ├── Name
│   ├── Role badge
│   ├── Verification status
│   ├── Member since date
│   ├── Listings count
│   └── Total earnings
│
├── Personal Information (editable)
│   ├── Full Name
│   ├── Email (read-only)
│   ├── Phone
│   └── Matric Number (read-only)
│
├── Professional Information
│   ├── Bio
│   ├── Specialties
│   └── Experience
│
└── Verification Status
    ├── Email Verified ✓
    ├── Student ID Verified ✓
    └── Agent Status: Active ✓
```

---

## Property Owner Flow

Property Owners have all Student features PLUS the ability to create roommate listings.

```
PROPERTY OWNER FEATURES
│
├── All Student Features (see Student Flow above)
│
├── CREATE ROOMMATE LISTING (/roommates/new)
│   ├── Same process as Student
│   └── Listed under "I'm an Owner" tab
│
├── MY ROOMMATE LISTINGS
│   └── View and manage created listings
│
└── PROFILE PAGE
    └── Shows roommate listings stats
```

---

## Admin Flow

Admins have access to all features plus platform management capabilities.

### Admin Dashboard

```
ADMIN DASHBOARD (/dashboard/admin)
│
├── Platform Stats
│   ├── Total Users (with agent/student breakdown)
│   ├── Total Listings (with active count)
│   ├── Pending Payment Proofs
│   └── Total Revenue (from approved payments)
│
├── PAYMENT PROOFS TAB
│   │
│   ├── View Pending Proofs
│   │   ├── Payment proof image
│   │   ├── Amount
│   │   ├── Payment method
│   │   ├── Transaction reference
│   │   ├── Submission date
│   │   └── Actions:
│   │       ├── APPROVE → User gets location access
│   │       └── REJECT → User notified with reason
│   │
│   └── Empty state when all reviewed
│
└── USERS TAB
    │
    ├── Users Table
    │   ├── Search by name/email
    │   ├── Filter by role (student/agent/owner/admin)
    │   ├── Filter by verification status
    │   └── Pagination
    │
    ├── User Row Information
    │   ├── Avatar
    │   ├── Name
    │   ├── Email
    │   ├── Role badge
    │   ├── Verification status
    │   ├── Email verification status
    │   └── Join date
    │
    └── User Actions
        ├── EDIT USER (modal)
        │   ├── Change role (student/agent/owner)
        │   ├── Toggle verification status
        │   └── Save changes
        ├── VERIFY AGENT
        │   └── Quick verify button for agents
        ├── UNVERIFY AGENT
        │   └── Remove verification
        └── DELETE USER
            └── Soft delete (can be recovered)
```

---

## Common Features

### Navigation

```
NAVBAR (all pages)
├── Logo → Home
├── Search bar → Listings search
├── Listings button
├── Roommates button
├── Theme toggle (Light/Dark)
└── User Menu (when logged in)
    ├── Dashboard (role-based link)
    ├── Profile
    └── Logout

MOBILE TAB BAR (mobile only)
├── Home
├── Listings
├── Roommates
├── Help
└── Profile/Login
```

### Email Verification Banner

```
VERIFICATION BANNER (shown when email not verified)
├── Warning message
├── "Verify Now" button → /auth/verify-email
└── Resend verification email option
```

### Theme Support

```
THEME OPTIONS
├── Light Mode
├── Dark Mode
└── System preference (auto)
```

### Image Upload (Cloudinary)

```
IMAGE UPLOAD COMPONENT
├── Drag and drop support
├── Click to browse
├── Progress indicator
├── Preview with remove option
├── Automatic optimization
└── Error handling with retry
```

---

## Technical Notes

### Authentication

- **JWT-based** authentication with access and refresh tokens
- **Access token**: 15 minutes validity
- **Refresh token**: 7 days validity
- Tokens stored in HTTP-only cookies
- Automatic token refresh on API calls

### Protected Routes

| Route Pattern        | Required Role          |
| -------------------- | ---------------------- |
| `/profile`           | Any authenticated user |
| `/unlock/*`          | Any authenticated user |
| `/dashboard/admin/*` | Admin only             |
| `/dashboard/agent/*` | Agent or Admin         |

### API Endpoints Structure

```
/api/auth/          - Authentication endpoints
/api/listings/      - Property listings CRUD
/api/roommates/     - Roommate listings CRUD
/api/payments/      - Payment proof submission/review
/api/users/         - User data and saved items
/api/admin/         - Admin-only endpoints
/api/agents/        - Agent-specific endpoints
```

### Data Flow

```
User Action → React Component → TanStack Query Hook → API Route → Service Layer → MongoDB
                                        ↓
                                   Cache Update
                                        ↓
                                   UI Re-render
```

### Email Notifications

- **Verification email**: On registration
- **Password reset**: On forgot password request
- **Welcome email**: On email verification completion
- **Payment approval/rejection**: On admin action

---

## Quick Reference Card

### For Students

1. Register → Verify Email → Browse Listings → Save Favorites → Unlock Location → Contact Agent

### For Agents

1. Register as Agent → Get Verified → Create Listings → Track Earnings → Export Reports

### For Owners

1. Register as Owner → Create Roommate Listing → Respond to Inquiries

### For Admins

1. Review Payment Proofs → Manage Users → Monitor Platform Stats

---

_Document Version: 1.0_
_Last Updated: December 2024_
_Platform: FUPRE Student Housing Platform_
