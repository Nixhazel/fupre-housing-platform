# FUPRE Housing Platform

A comprehensive student housing and roommate matching platform for Federal University of Petroleum Resources (FUPRE), Effurun, Delta State, Nigeria.

## 🏠 Features

### For Students

- **Browse Listings**: Search and filter student accommodations near FUPRE campus
- **Location Unlock**: Pay ₦1,000 to unlock exact location and contact details
- **Roommate Matching**: Find compatible roommates based on preferences
- **Verified Agents**: Connect with verified student agents (ISAs)
- **Mobile-First**: Optimized for mobile devices (90% of users)

### For Student Agents (ISAs)

- **Create Listings**: Post property listings with photos and details
- **Dashboard**: Track views, earnings, and listing performance
- **Commission System**: Earn from successful bookings
- **Verification**: Get verified with matric number and ID

### For Property Owners

- **Roommate Posts**: Find roommates for your properties
- **Preference Matching**: Set preferences for ideal roommates
- **Direct Communication**: Connect with potential roommates

### For Admins

- **Payment Review**: Approve/reject payment proofs
- **User Management**: Oversee platform operations
- **Analytics**: Track platform performance

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router) with React 18 and TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI)
- **State Management**: Zustand with localStorage persistence
- **Forms**: react-hook-form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Theme**: next-themes (Dark/Light mode)
- **Currency**: Nigerian Naira (₦) formatting

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (marketing)/       # Marketing pages
│   ├── auth/              # Authentication pages
│   ├── listings/          # Property listings
│   ├── roommates/         # Roommate matching
│   ├── dashboard/         # User dashboards
│   └── unlock/            # Payment unlock flow
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── listing/          # Listing-specific components
│   ├── roommate/         # Roommate-specific components
│   ├── shared/           # Shared components
│   └── providers/        # Context providers
├── lib/                  # Utilities and configurations
│   ├── store/            # Zustand stores
│   ├── validators/       # Zod schemas
│   └── utils/            # Helper functions
├── data/                 # Mock data
└── types/                # TypeScript type definitions
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd shp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Generate placeholder images** (Optional)

   - Open `public/generate-placeholders.html` in your browser
   - Download and save images to appropriate directories:
     - `public/images/listings/` - Property photos
     - `public/images/roommates/` - Roommate photos
     - `public/images/avatars/` - User avatars
     - `public/images/payments/` - Payment receipts
     - `public/maps/` - Map images (blurred and clear)

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Demo Credentials

### Students

- **Email**: john@fupre.edu.ng
- **Password**: password123

### Student Agents (ISAs)

- **Email**: sarah@fupre.edu.ng
- **Password**: password123

### Admins

- **Email**: admin@fupre.edu.ng
- **Password**: password123

## 📱 Key Features Walkthrough

### 1. Browse Listings

- Visit `/listings` to see all available properties
- Use filters to narrow down by price, location, amenities
- Click on any listing to view details

### 2. Unlock Location

- On listing detail page, click "Unlock Location (₦1,000)"
- Upload payment proof (screenshot of bank transfer/USSD/POS)
- Admin will review and approve (demo: auto-approve)

### 3. Find Roommates

- Visit `/roommates` to browse roommate listings
- Filter by budget, gender, cleanliness preferences
- Create your own roommate listing if you're looking for someone

### 4. Agent Dashboard

- Login as an agent to access `/dashboard/agent`
- Create new listings, track performance
- View earnings and manage existing listings

### 5. Admin Panel

- Login as admin to access `/dashboard/admin`
- Review pending payment proofs
- Approve/reject unlock requests

## 🎨 Design System

### Colors

- **Primary**: Indigo (#4F46E5)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography

- **Headings**: Geist Sans (Bold)
- **Body**: Geist Sans (Regular)
- **Code**: Geist Mono

### Components

- Built with shadcn/ui for consistency
- Fully accessible with ARIA labels
- Responsive design (mobile-first)

## 📊 Data Models

### User Types

- **Student**: Browse and book accommodations
- **Agent**: Create listings, earn commissions
- **Owner**: Find roommates for properties
- **Admin**: Platform management

### Campus Areas

- Ugbomro
- Effurun
- Enerhen
- PTI Road
- Other

### Payment Methods

- Bank Transfer
- USSD
- POS

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks

# Data Management
npm run seed:reset   # Reset localStorage data
```

## 🌙 Dark Mode

The platform supports both light and dark themes:

- Toggle in the navigation bar
- Respects system preference by default
- Persists user choice in localStorage

## 📱 Mobile Optimization

- **Mobile-first design**: Optimized for 360-430px screens
- **Touch-friendly**: 44px minimum touch targets
- **Bottom navigation**: Easy thumb navigation
- **Responsive images**: Optimized loading
- **PWA ready**: Basic manifest and meta tags

## 🔒 Security Features

- **Role-based access**: Different permissions for each user type
- **Payment verification**: Admin approval for unlocks
- **Input validation**: Zod schemas for all forms
- **XSS protection**: Sanitized user inputs

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms

```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:

- Email: support@fuprehousing.com
- Phone: +234 801 234 5678

## 🎉 Acknowledgments

- FUPRE community for feedback and testing
- shadcn/ui for the excellent component library
- Next.js team for the amazing framework
- All contributors and supporters

---

**Built with ❤️ for the FUPRE community**
