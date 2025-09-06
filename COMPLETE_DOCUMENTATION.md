# 📚 **Complete FUPRE Housing Platform Documentation**

## **Table of Contents**

1. [Project Overview](#project-overview)
2. [Detailed Tech Stack & Package Implementation](#detailed-tech-stack--package-implementation)
3. [Project Structure & Architecture](#project-structure--architecture)
4. [UI Components & Styling Deep Dive](#ui-components--styling-deep-dive)
5. [State Management Implementation](#state-management-implementation)
6. [Authentication & Authorization](#authentication--authorization)
7. [Form Handling & Validation](#form-handling--validation)
8. [Routing & Navigation System](#routing--navigation-system)
9. [Data Models & Type Safety](#data-models--type-safety)
10. [Performance & Optimization](#performance--optimization)
11. [Build System & Deployment](#build-system--deployment)
12. [Code Quality & Development Tools](#code-quality--development-tools)

---

## **1. Project Overview**

### **What is this project?**

This is a **Student Housing and Roommate Platform** specifically designed for **Federal University of Petroleum Resources (FUPRE)** in Delta State, Nigeria. Think of it as a "student-friendly Airbnb" where:

- **Students** can find housing near campus
- **Property owners** can list their properties
- **Agents** can manage listings and earn commissions
- **Students** can find roommates to share accommodation costs

### **Key Features:**

- 🏠 **Property Listings** - Browse and search for student housing
- 👥 **Roommate Matching** - Find compatible roommates
- 💰 **Payment System** - Pay to unlock property locations
- 📊 **Agent Dashboard** - Manage listings and track earnings
- 👤 **User Profiles** - Manage personal information
- 🌙 **Dark/Light Mode** - User preference theming

---

## **2. Detailed Tech Stack & Package Implementation**

### **2.1 Next.js 15 - App Router Implementation**

```json
"next": "^15.5.2"
```

**Why Next.js 15?**
- **App Router** - Modern file-based routing (replaces Pages Router)
- **Server Components** - Render on server for better performance
- **Streaming** - Progressive page loading
- **Built-in optimizations** - Image, font, and script optimization

**Key Implementation Details:**

```typescript
// next.config.js - Configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true, // Enable App Router
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'], // Modern image formats
  },
  typescript: {
    ignoreBuildErrors: false, // Strict type checking
  },
  eslint: {
    ignoreDuringBuilds: false, // Lint during build
  },
};

module.exports = nextConfig;
```

**App Router Structure:**
```
src/app/
├── layout.tsx          # Root layout (wraps all pages)
├── page.tsx           # Home page (/)
├── loading.tsx        # Loading UI
├── error.tsx          # Error UI
├── not-found.tsx      # 404 page
├── auth/
│   ├── login/page.tsx # /auth/login
│   └── register/page.tsx
└── dashboard/
    └── agent/
        ├── page.tsx   # /dashboard/agent
        └── listings/page.tsx # /dashboard/agent/listings
```

### **2.2 TypeScript Configuration & Usage**

```json
"typescript": "^5.7.2"
```

**tsconfig.json Implementation:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Type Safety Implementation:**
```typescript
// src/types/index.ts - Central type definitions
export type ID = string;
export type Role = 'student' | 'owner' | 'agent' | 'admin';

// Strict interface definitions
export interface User {
  id: ID;
  name: string;
  email: string;
  phone?: string; // Optional field
  avatarUrl?: string;
  role: Role;
  verified: boolean;
  createdAt: string;
  savedListingIds: ID[];
  unlockedListingIds: ID[];
  agentProfile?: AgentProfile; // Optional nested object
}

// Generic utility types
export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
}
```

### **2.3 Tailwind CSS - Utility-First Styling**

```json
"tailwindcss": "^3.4.15"
```

**tailwind.config.js Implementation:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
  darkMode: 'class', // Enable class-based dark mode
};
```

**CSS Class Usage Patterns:**
```typescript
// Responsive design with Tailwind
const responsiveClasses = `
  grid grid-cols-1           // Mobile: 1 column
  sm:grid-cols-2            // Small: 2 columns  
  md:grid-cols-3            // Medium: 3 columns
  lg:grid-cols-4            // Large: 4 columns
  xl:grid-cols-5            // Extra large: 5 columns
  gap-4                     // Consistent spacing
  p-4                       // Padding
  m-2                       // Margin
`;

// Dark mode implementation
const darkModeClasses = `
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-700
  hover:bg-gray-50 dark:hover:bg-gray-800
`;

// State-based styling
const stateClasses = `
  ${isActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}
  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'}
  ${isLoading ? 'animate-pulse' : ''}
`;
```

### **2.4 Radix UI - Headless Components**

```json
"@radix-ui/react-*": "^1.0.0+"
```

**Why Radix UI?**
- **Accessibility first** - ARIA attributes, keyboard navigation
- **Headless** - No default styling, full control
- **Composable** - Build complex components from primitives
- **TypeScript** - Full type safety

**Button Component Implementation:**
```typescript
// src/components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define button variants using CVA
const buttonVariants = cva(
  // Base styles (always applied)
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### **2.5 Class Variance Authority (CVA) - Component Variants**

```json
"class-variance-authority": "^0.7.0"
```

**What is CVA?**
- **Type-safe** component variants
- **Composable** styling system
- **IntelliSense** support for variants
- **Runtime** and **compile-time** validation

**CVA Implementation Example:**
```typescript
// src/components/ui/badge.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  // Base classes
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
```

### **2.6 clsx & cn Utility - Class Name Management**

```json
"clsx": "^2.1.1"
```

**Why clsx?**
- **Conditional** class application
- **Performance** optimized
- **TypeScript** support
- **Small** bundle size

**cn Utility Implementation:**
```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combine clsx with tailwind-merge for optimal class handling
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage examples
const buttonClasses = cn(
  'px-4 py-2 rounded-md', // Base classes
  isActive && 'bg-blue-500 text-white', // Conditional classes
  isDisabled && 'opacity-50 cursor-not-allowed', // More conditionals
  className // Additional classes from props
);

// Complex conditional styling
const cardClasses = cn(
  'p-4 rounded-lg border transition-all duration-200',
  {
    'bg-white border-gray-200 hover:border-gray-300': !isDark,
    'bg-gray-800 border-gray-700 hover:border-gray-600': isDark,
    'shadow-lg': hasShadow,
    'cursor-pointer hover:shadow-xl': isClickable,
  },
  size === 'large' && 'p-6',
  size === 'small' && 'p-2'
);
```

### **2.7 Zustand - State Management**

```json
"zustand": "^5.0.2"
```

**Why Zustand?**
- **Minimal boilerplate** compared to Redux
- **TypeScript** first-class support
- **Persistence** middleware built-in
- **DevTools** integration
- **Small** bundle size (~2kb)

**Store Implementation:**
```typescript
// src/lib/store/authSlice.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import type { User, Role } from '@/types';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (credentials: { email: string; password: string }) => Promise<User | null>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,

        // Actions
        login: async (credentials) => {
          set((state) => {
            state.isLoading = true;
          });

          try {
            // Mock authentication - replace with real API call
            const mockUsers = [
              {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'student' as Role,
                verified: true,
                createdAt: new Date().toISOString(),
                savedListingIds: [],
                unlockedListingIds: [],
              },
              {
                id: '2',
                name: 'Jane Agent',
                email: 'agent@example.com',
                role: 'agent' as Role,
                verified: true,
                createdAt: new Date().toISOString(),
                savedListingIds: [],
                unlockedListingIds: [],
                agentProfile: {
                  licenseNumber: 'AG123456',
                  experience: 5,
                  specialties: ['Student Housing', 'Campus Properties'],
                },
              },
            ];

            const user = mockUsers.find(u => u.email === credentials.email);
            
            if (user) {
              const token = `mock-jwt-${Date.now()}`;
              
              set((state) => {
                state.user = user;
                state.token = token;
                state.isAuthenticated = true;
                state.isLoading = false;
              });
              
              return user;
            } else {
              throw new Error('Invalid credentials');
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
            });
            throw error;
          }
        },

        logout: () => {
          set((state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
          });
        },

        updateUser: (updates) => {
          set((state) => {
            if (state.user) {
              Object.assign(state.user, updates);
            }
          });
        },

        setLoading: (loading) => {
          set((state) => {
            state.isLoading = loading;
          });
        },
      })),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);
```

**Store Usage in Components:**
```typescript
// Using the auth store in a component
'use client';

import { useAuthStore } from '@/lib/store/authSlice';

function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  
  const handleUpdateProfile = (updates: Partial<User>) => {
    updateUser(updates);
  };

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p>Welcome, {user.name}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### **2.8 React Hook Form + Zod - Form Handling**

```json
"react-hook-form": "^7.54.2",
"zod": "^3.24.1",
"@hookform/resolvers": "^3.9.1"
```

**Why React Hook Form + Zod?**
- **Performance** - Minimal re-renders
- **Type safety** - Automatic TypeScript types
- **Validation** - Runtime and compile-time validation
- **Developer experience** - Great error messages

**Zod Schema Definition:**
```typescript
// src/lib/validators/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['student', 'owner', 'agent'], {
      required_error: 'Please select a role',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

**Form Component Implementation:**
```typescript
// src/components/forms/LoginForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/store/authSlice';
import { loginSchema, type LoginFormData } from '@/lib/validators/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const { login, isLoading } = useAuthStore();
  const [error, setError] = React.useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data);
      // Redirect will be handled by the auth store
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### **2.9 Framer Motion - Animations**

```json
"framer-motion": "^11.15.0"
```

**Why Framer Motion?**
- **Declarative** animation API
- **Performance** optimized
- **Gesture** support
- **Layout** animations
- **TypeScript** support

**Animation Implementation:**
```typescript
// src/components/animations/PageTransition.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

**Staggered Animation Component:**
```typescript
// src/components/animations/StaggeredList.tsx
'use client';

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

interface StaggeredListProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggeredList({ children, className }: StaggeredListProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

**Hover Animation Component:**
```typescript
// src/components/animations/HoverCard.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverCard({ children, className }: HoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={className}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.02,
        y: -2,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      <motion.div
        animate={{
          boxShadow: isHovered
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
        transition={{ duration: 0.2 }}
        className="rounded-lg bg-white p-4 border"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
```

### **Icons & Utilities**

```json
"lucide-react": "^0.468.0",
"dayjs": "^1.11.13",
"clsx": "^2.1.1"
```

**What is Lucide React?**

- **Icon library** with 1000+ icons
- Consistent, customizable icons
- Used throughout the app for buttons, navigation, etc.

**What is Day.js?**

- **Date manipulation library**
- Lightweight alternative to Moment.js
- Formats dates, calculates time differences

**What is clsx?**

- **Utility for combining CSS classes**
- Conditionally applies classes
- Example: `clsx('base-class', isActive && 'active-class')`

### **Development Tools**

```json
"eslint": "^9.17.0",
"prettier": "^3.4.2",
"husky": "^9.1.7",
"lint-staged": "^15.2.10"
```

**What is ESLint?**

- **Code linting tool**
- Finds and fixes code quality issues
- Enforces coding standards

**What is Prettier?**

- **Code formatter**
- Automatically formats code consistently
- Makes code readable and maintainable

**What is Husky?**

- **Git hooks** tool
- Runs scripts before commits
- Ensures code quality before pushing

**What is lint-staged?**

- **Runs linters** on staged files only
- Faster than linting entire codebase
- Used with Husky for pre-commit hooks

---

## **3. Project Structure**

```
shp/
├── public/                          # Static files
│   ├── icons/                       # App icons
│   └── generate-placeholders.html   # Image generator
├── src/
│   ├── app/                         # Next.js App Router pages
│   │   ├── auth/                    # Authentication pages
│   │   ├── dashboard/               # Dashboard pages
│   │   ├── listings/                # Property listings
│   │   ├── roommates/               # Roommate features
│   │   ├── profile/                 # User profile
│   │   ├── help/                    # Help & FAQ
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Home page
│   ├── components/                  # Reusable components
│   │   ├── layout/                  # Layout components
│   │   ├── shared/                  # Common components
│   │   ├── listing/                 # Listing-specific components
│   │   ├── roommate/                # Roommate components
│   │   └── providers/               # Context providers
│   ├── lib/                         # Utilities and configurations
│   │   ├── store/                   # Zustand stores
│   │   ├── validators/              # Zod schemas
│   │   └── utils/                   # Helper functions
│   ├── data/                        # Sample data
│   └── types/                       # TypeScript type definitions
├── package.json                     # Dependencies and scripts
├── tailwind.config.js               # Tailwind configuration
├── next.config.js                   # Next.js configuration
└── README.md                        # Project documentation
```

### **Why This Structure?**

- **`src/app/`** - Next.js App Router convention
- **`src/components/`** - Reusable UI components
- **`src/lib/`** - Business logic and utilities
- **`src/data/`** - Sample data for development
- **`src/types/`** - TypeScript definitions

---

## **4. Core Features & Implementation**

### **4.1 Landing Page (`/`)**

**What it does:**

- First page users see
- Showcases the platform's value
- Provides search functionality
- Displays featured listings

**Key Components:**

```typescript
// Hero section with search
<HeroSection />
// How it works steps
<HowItWorks />
// Featured listings carousel
<FeaturedListings />
// User testimonials
<Testimonials />
// Key statistics
<StatsSection />
```

**Implementation Details:**

- **Framer Motion** animations for smooth reveals
- **Responsive design** for mobile and desktop
- **Search integration** with listings page
- **Call-to-action** buttons for user engagement

### **4.2 Property Listings (`/listings`)**

**What it does:**

- Browse all available properties
- Filter by price, location, amenities
- Search by keywords
- View in grid or list format

**Key Features:**

```typescript
// Filter system
const filters = {
	priceRange: [0, 100000],
	bedrooms: [],
	bathrooms: [],
	campusAreas: [],
	amenities: [],
	sortBy: 'newest'
};

// Search functionality
const searchQuery = '';

// View modes
const viewMode = 'grid' | 'list';
```

**Implementation:**

- **Zustand store** manages filters and search
- **URL parameters** for shareable filtered views
- **Infinite scroll** for performance
- **Saved listings** filter (`?saved=true`)

### **4.3 Property Details (`/listings/[id]`)**

**What it does:**

- Shows detailed property information
- Image gallery with zoom
- Agent contact information
- Location unlock system
- Reviews and ratings

**Key Components:**

```typescript
// Image gallery
<ImageGallery images={listing.images} />
// Property details
<PropertyDetails listing={listing} />
// Agent card
<AgentCard agent={agent} />
// Location unlock
<MapBlur listing={listing} />
// Reviews
<ReviewsSection reviews={reviews} />
```

**Location Unlock System:**

- **Blurred map** by default
- **Payment required** (₦1000) to unlock
- **Admin approval** system
- **Secure location** sharing

### **4.4 Roommate Matching (`/roommates`)**

**What it does:**

- Find compatible roommates
- Create roommate listings
- Filter by preferences
- Contact potential roommates

**Key Features:**

```typescript
// Roommate preferences
interface RoommateListing {
	studyHours: 'early' | 'late' | 'flexible';
	smoking: 'yes' | 'no' | 'sometimes';
	pets: 'yes' | 'no' | 'allergic';
	budget: number;
	moveInDate: string;
}
```

**Implementation:**

- **Tab system** for different views
- **Filter by preferences** (study hours, smoking, pets)
- **Budget matching** algorithm
- **Contact system** for interested users

### **4.5 Agent Dashboard (`/dashboard/agent`)**

**What it does:**

- Manage property listings
- Track earnings and performance
- View analytics and statistics
- Manage profile and verification

**Key Sections:**

```typescript
// Dashboard overview
<DashboardOverview />
// Listings management
<ListingsManagement />
// Earnings tracking
<EarningsDashboard />
// Profile management
<ProfileManagement />
```

**Features:**

- **KPI cards** (active listings, views, earnings)
- **Charts and graphs** for analytics
- **CRUD operations** for listings
- **Status management** (available/taken)
- **Photo upload** system

### **4.6 Admin Dashboard (`/dashboard/admin`)**

**What it does:**

- Manage all users
- Approve payment proofs
- Monitor platform activity
- Handle user verification

**Key Features:**

```typescript
// User management
<UserManagement />
// Payment approval
<PaymentApproval />
// Platform statistics
<PlatformStats />
```

**Implementation:**

- **Role-based access** control
- **Payment proof** review system
- **User verification** management
- **Bulk operations** for efficiency

---

## **5. State Management**

### **5.1 Zustand Overview**

**What is Zustand?**

- **Lightweight state management** library
- **Simpler than Redux** (less boilerplate)
- **TypeScript support** built-in
- **Persistence** to localStorage

### **5.2 Store Structure**

```typescript
// Store slice example
interface AuthSlice {
	// State
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;

	// Actions
	login: (credentials: LoginForm) => Promise<User | null>;
	logout: () => void;
	updateUser: (updates: Partial<User>) => void;
}
```

### **5.3 Store Slices**

#### **Auth Store (`authSlice.ts`)**

```typescript
// Manages user authentication
const useAuthStore = create<AuthSlice>()(
	persist(
		(set, get) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,

			login: async (credentials) => {
				// Mock authentication logic
				const user = mockUsers.find((u) => u.email === credentials.email);
				if (user) {
					set({ user, token: 'mock-jwt', isAuthenticated: true });
					return user;
				}
				throw new Error('Invalid credentials');
			},

			logout: () => {
				set({ user: null, token: null, isAuthenticated: false });
			}
		}),
		{
			name: 'auth-storage',
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				isAuthenticated: state.isAuthenticated
			})
		}
	)
);
```

**What this does:**

- **Persists** login state across page refreshes
- **Manages** user information globally
- **Provides** authentication methods
- **Handles** login/logout flow

#### **Listings Store (`listingsSlice.ts`)**

```typescript
// Manages property listings
const useListingsStore = create<ListingsSlice>()(
	persist(
		(set, get) => ({
			listings: [],
			filters: defaultFilters,
			searchQuery: '',
			viewMode: 'grid',

			setFilters: (newFilters) => set({ filters: newFilters }),
			setSearchQuery: (query) => set({ searchQuery: query }),
			getFilteredListings: () => {
				// Filter and search logic
				return filteredListings;
			}
		}),
		{ name: 'listings-storage' }
	)
);
```

**What this does:**

- **Stores** all property listings
- **Manages** filters and search
- **Provides** filtered results
- **Persists** user preferences

#### **Payments Store (`paymentsSlice.ts`)**

```typescript
// Manages payment proofs
const usePaymentsStore = create<PaymentsSlice>()(
	persist(
		(set, get) => ({
			paymentProofs: [],

			createPaymentProof: (proof) => {
				const newProof = { ...proof, id: generateId(), status: 'pending' };
				set((state) => ({
					paymentProofs: [...state.paymentProofs, newProof]
				}));
				return newProof;
			},

			updatePaymentStatus: (id, status) => {
				set((state) => ({
					paymentProofs: state.paymentProofs.map((proof) =>
						proof.id === id ? { ...proof, status } : proof
					)
				}));
			}
		}),
		{ name: 'payments-storage' }
	)
);
```

**What this does:**

- **Tracks** payment proofs
- **Manages** approval workflow
- **Updates** payment status
- **Persists** payment history

#### **Roommates Store (`roommatesSlice.ts`)**

```typescript
// Manages roommate listings
const useRoommatesStore = create<RoommatesSlice>()(
	persist(
		(set, get) => ({
			roommateListings: [],

			createRoommateListing: (listing) => {
				const newListing = { ...listing, id: generateId() };
				set((state) => ({
					roommateListings: [...state.roommateListings, newListing]
				}));
				return newListing;
			},

			getFilteredRoommates: (filters) => {
				// Filter roommate listings
				return filteredListings;
			}
		}),
		{ name: 'roommates-storage' }
	)
);
```

**What this does:**

- **Stores** roommate listings
- **Manages** roommate preferences
- **Provides** filtered results
- **Handles** roommate matching

### **5.4 Using Stores in Components**

```typescript
// Example: Using auth store
function ProfilePage() {
	const { user, updateUser } = useAuthStore();

	const handleUpdateProfile = (updates) => {
		updateUser(updates);
	};

	return (
		<div>
			<h1>Welcome, {user?.name}</h1>
			{/* Profile form */}
		</div>
	);
}

// Example: Using listings store
function ListingsPage() {
	const { listings, filters, setFilters, getFilteredListings } =
		useListingsStore();

	const filteredListings = getFilteredListings();

	return (
		<div>
			{filteredListings.map((listing) => (
				<ListingCard key={listing.id} listing={listing} />
			))}
		</div>
	);
}
```

---

## **6. Authentication System**

### **6.1 Authentication Flow**

```typescript
// Login process
1. User enters email/password
2. Form validation with Zod
3. Mock authentication check
4. Store user data in Zustand
5. Redirect based on user role
6. Persist login state
```

### **6.2 User Roles**

```typescript
type Role = 'student' | 'owner' | 'agent' | 'admin';

// Role permissions
const rolePermissions = {
	student: ['view_listings', 'create_roommate_listing'],
	owner: ['view_listings', 'create_roommate_listing'],
	agent: ['view_listings', 'create_listings', 'manage_listings'],
	admin: ['view_all', 'manage_users', 'approve_payments']
};
```

### **6.3 Mock Authentication**

```typescript
// Mock users for development
const mockUsers = [
	{
		id: 'user-1',
		name: 'John Doe',
		email: 'john@example.com',
		role: 'student',
		verified: true,
		savedListingIds: ['listing-1', 'listing-2']
	},
	{
		id: 'agent-1',
		name: 'Jane Smith',
		email: 'jane@example.com',
		role: 'agent',
		verified: true,
		agentProfile: {
			/* agent details */
		}
	}
];
```

### **6.4 Role-Based Routing**

```typescript
// Login redirect logic
const onSubmit = async (data: LoginFormData) => {
	const user = await login(data);

	// Redirect based on role
	if (user?.role === 'admin') {
		router.push('/dashboard/admin');
	} else if (user?.role === 'agent') {
		router.push('/dashboard/agent');
	} else {
		router.push('/');
	}
};
```

### **6.5 Route Protection**

```typescript
// Guard functions
export const canAccessAgent = (role: Role): boolean => {
	return role === 'agent' || role === 'admin';
};

export const canAccessAdmin = (role: Role): boolean => {
	return role === 'admin';
};

// Usage in components
function AgentDashboard() {
	const { user } = useAuthStore();

	if (!user || !canAccessAgent(user.role)) {
		return <AccessDenied />;
	}

	return <AgentDashboardContent />;
}
```

---

## **7. UI Components & Styling**

### **7.1 Tailwind CSS Setup**

```javascript
// tailwind.config.js
module.exports = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}'
	],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#eef2ff',
					500: '#6366f1',
					600: '#4f46e5',
					700: '#4338ca'
				}
			}
		}
	},
	plugins: []
};
```

### **7.2 Component Structure**

```typescript
// Example: Button component
interface ButtonProps {
	variant?: 'default' | 'outline' | 'ghost';
	size?: 'sm' | 'md' | 'lg';
	children: React.ReactNode;
	onClick?: () => void;
}

export function Button({
	variant = 'default',
	size = 'md',
	children,
	onClick
}: ButtonProps) {
	return (
		<button
			className={clsx(
				'inline-flex items-center justify-center rounded-md font-medium transition-colors',
				{
					'bg-primary-600 text-white hover:bg-primary-700':
						variant === 'default',
					'border border-gray-300 bg-white hover:bg-gray-50':
						variant === 'outline',
					'hover:bg-gray-100': variant === 'ghost'
				},
				{
					'h-8 px-3 text-sm': size === 'sm',
					'h-10 px-4': size === 'md',
					'h-12 px-6 text-lg': size === 'lg'
				}
			)}
			onClick={onClick}>
			{children}
		</button>
	);
}
```

### **7.3 Responsive Design**

```typescript
// Mobile-first approach
<div
	className='
  grid grid-cols-1           // Mobile: 1 column
  md:grid-cols-2            // Tablet: 2 columns
  lg:grid-cols-3            // Desktop: 3 columns
  gap-4                     // Consistent spacing
'>
	{listings.map((listing) => (
		<ListingCard key={listing.id} listing={listing} />
	))}
</div>
```

### **7.4 Dark Mode Support**

```typescript
// Theme provider setup
import { ThemeProvider } from 'next-themes';

function RootLayout({ children }) {
	return (
		<html lang='en' suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}

// Dark mode classes
<div
	className='
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-white
  border-gray-200 dark:border-gray-700
'>
	Content
</div>;
```

### **7.5 Animation with Framer Motion**

```typescript
import { motion } from 'framer-motion';

// Page transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  <PageContent />
</motion.div>

// Staggered animations
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map((item, index) => (
    <motion.div
      key={index}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## **8. Data Models & Types**

### **8.1 Core Types**

```typescript
// src/types/index.ts

// Base types
export type ID = string;
export type Role = 'student' | 'owner' | 'agent' | 'admin';

// User interface
export interface User {
	id: ID;
	name: string;
	email: string;
	phone?: string;
	avatarUrl?: string;
	role: Role;
	verified: boolean;
	createdAt: string;
	savedListingIds: ID[];
	unlockedListingIds: ID[];
	agentProfile?: AgentProfile;
}

// Listing interface
export interface Listing {
	id: ID;
	title: string;
	description: string;
	price: number;
	images: string[];
	location: {
		address: string;
		coordinates: [number, number];
		campusArea: string;
	};
	details: {
		bedrooms: number;
		bathrooms: number;
		area: number;
		amenities: string[];
	};
	agentId: ID;
	status: 'available' | 'taken';
	views: number;
	createdAt: string;
	updatedAt: string;
}

// Payment proof interface
export interface PaymentProof {
	id: ID;
	userId: ID;
	listingId: ID;
	amount: number;
	paymentMethod: 'bank_transfer' | 'card' | 'cash';
	reference: string;
	proofImage: string;
	status: 'pending' | 'approved' | 'rejected';
	createdAt: string;
	reviewedAt?: string;
	reviewedBy?: ID;
}

// Roommate listing interface
export interface RoommateListing {
	id: ID;
	userId: ID;
	title: string;
	description: string;
	budget: number;
	preferences: {
		studyHours: 'early' | 'late' | 'flexible';
		smoking: 'yes' | 'no' | 'sometimes';
		pets: 'yes' | 'no' | 'allergic';
		gender: 'male' | 'female' | 'any';
	};
	moveInDate: string;
	duration: number;
	images: string[];
	status: 'active' | 'inactive';
	createdAt: string;
}
```

### **8.2 Why These Types?**

**User Interface:**

- **`id`** - Unique identifier
- **`role`** - Determines permissions
- **`verified`** - Trust and security
- **`savedListingIds`** - User preferences
- **`unlockedListingIds`** - Payment history

**Listing Interface:**

- **`location`** - Geographic information
- **`details`** - Property specifications
- **`status`** - Availability tracking
- **`views`** - Analytics data

**Payment Proof Interface:**

- **`status`** - Approval workflow
- **`proofImage`** - Visual verification
- **`reference`** - Transaction tracking

**Roommate Listing Interface:**

- **`preferences`** - Compatibility matching
- **`budget`** - Financial compatibility
- **`moveInDate`** - Timing coordination

---

## **9. Form Validation**

### **9.1 Zod Schemas**

```typescript
// src/lib/validators/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters')
});

export const registerSchema = z
	.object({
		name: z.string().min(2, 'Name must be at least 2 characters'),
		email: z.string().email('Invalid email address'),
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z.string(),
		role: z.enum(['student', 'owner', 'agent'])
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

// src/lib/validators/listings.ts
export const listingSchema = z.object({
	title: z.string().min(5, 'Title must be at least 5 characters'),
	description: z.string().min(20, 'Description must be at least 20 characters'),
	price: z.number().min(1000, 'Price must be at least ₦1,000'),
	bedrooms: z.number().min(1, 'Must have at least 1 bedroom'),
	bathrooms: z.number().min(1, 'Must have at least 1 bathroom'),
	area: z.number().min(10, 'Area must be at least 10 sq ft'),
	campusArea: z.string().min(1, 'Please select a campus area'),
	amenities: z.array(z.string()).min(1, 'Please select at least one amenity'),
	images: z.array(z.string()).min(1, 'Please upload at least one image')
});
```

### **9.2 React Hook Form Integration**

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function LoginForm() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema)
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			await login(data);
			toast.success('Login successful!');
		} catch (error) {
			toast.error('Invalid credentials');
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div>
				<label htmlFor='email'>Email</label>
				<input
					{...register('email')}
					type='email'
					className={errors.email ? 'border-red-500' : ''}
				/>
				{errors.email && (
					<p className='text-red-500 text-sm'>{errors.email.message}</p>
				)}
			</div>

			<div>
				<label htmlFor='password'>Password</label>
				<input
					{...register('password')}
					type='password'
					className={errors.password ? 'border-red-500' : ''}
				/>
				{errors.password && (
					<p className='text-red-500 text-sm'>{errors.password.message}</p>
				)}
			</div>

			<button type='submit' disabled={isSubmitting}>
				{isSubmitting ? 'Logging in...' : 'Login'}
			</button>
		</form>
	);
}
```

### **9.3 Why This Approach?**

**Zod Benefits:**

- **Type safety** - Automatic TypeScript types
- **Runtime validation** - Catches invalid data
- **Error messages** - User-friendly feedback
- **Schema composition** - Reusable validation rules

**React Hook Form Benefits:**

- **Performance** - Minimal re-renders
- **Validation** - Built-in error handling
- **Accessibility** - Proper form semantics
- **Integration** - Works with Zod seamlessly

---

## **10. Routing & Navigation**

### **10.1 Next.js App Router**

```typescript
// File-based routing structure
src/app/
├── page.tsx                    // Home page (/)
├── layout.tsx                  // Root layout
├── auth/
│   ├── login/page.tsx          // Login page (/auth/login)
│   └── register/page.tsx       // Register page (/auth/register)
├── listings/
│   ├── page.tsx                // Listings index (/listings)
│   └── [id]/page.tsx           // Listing detail (/listings/123)
├── roommates/
│   ├── page.tsx                // Roommates index (/roommates)
│   ├── new/page.tsx            // New roommate listing (/roommates/new)
│   └── [id]/page.tsx           // Roommate detail (/roommates/123)
└── dashboard/
    ├── agent/
    │   ├── page.tsx            // Agent dashboard (/dashboard/agent)
    │   ├── listings/page.tsx   // Agent listings (/dashboard/agent/listings)
    │   ├── earnings/page.tsx   // Agent earnings (/dashboard/agent/earnings)
    │   └── profile/page.tsx    // Agent profile (/dashboard/agent/profile)
    └── admin/
        └── page.tsx            // Admin dashboard (/dashboard/admin)
```

### **10.2 Navigation Components**

```typescript
// Top navigation bar
function Navbar() {
	const { user, isAuthenticated } = useAuthStore();

	return (
		<nav className='bg-white shadow-sm border-b'>
			<div className='container mx-auto px-4'>
				<div className='flex items-center justify-between h-16'>
					<Link href='/' className='text-xl font-bold'>
						FUPRE Housing
					</Link>

					<div className='flex items-center space-x-4'>
						{isAuthenticated ? (
							<>
								<Link href='/listings'>Listings</Link>
								<Link href='/roommates'>Roommates</Link>
								<Link href='/profile'>Profile</Link>
								<Button onClick={logout}>Logout</Button>
							</>
						) : (
							<>
								<Link href='/auth/login'>Login</Link>
								<Link href='/auth/register'>Register</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}

// Mobile bottom tab bar
function MobileTabBar() {
	return (
		<div className='fixed bottom-0 left-0 right-0 bg-white border-t md:hidden'>
			<div className='flex items-center justify-around py-2'>
				<Link href='/' className='flex flex-col items-center'>
					<Home className='h-5 w-5' />
					<span className='text-xs'>Home</span>
				</Link>
				<Link href='/listings' className='flex flex-col items-center'>
					<Building2 className='h-5 w-5' />
					<span className='text-xs'>Listings</span>
				</Link>
				<Link href='/roommates' className='flex flex-col items-center'>
					<Users className='h-5 w-5' />
					<span className='text-xs'>Roommates</span>
				</Link>
				<Link href='/profile' className='flex flex-col items-center'>
					<User className='h-5 w-5' />
					<span className='text-xs'>Profile</span>
				</Link>
			</div>
		</div>
	);
}
```

### **10.3 Dynamic Routes**

```typescript
// Dynamic route: /listings/[id]
function ListingDetailPage({ params }: { params: { id: string } }) {
	const { getListingById } = useListingsStore();
	const listing = getListingById(params.id);

	if (!listing) {
		return <NotFound />;
	}

	return (
		<div>
			<h1>{listing.title}</h1>
			<p>{listing.description}</p>
			{/* Listing details */}
		</div>
	);
}

// Search params: /listings?saved=true
function ListingsPage() {
	const searchParams = useSearchParams();
	const showSavedOnly = searchParams.get('saved') === 'true';

	return (
		<div>
			<h1>{showSavedOnly ? 'Saved Listings' : 'All Listings'}</h1>
			{/* Filtered content */}
		</div>
	);
}
```

### **10.4 Programmatic Navigation**

```typescript
import { useRouter } from 'next/navigation';

function LoginForm() {
	const router = useRouter();

	const onSubmit = async (data: LoginFormData) => {
		const user = await login(data);

		// Redirect based on role
		if (user?.role === 'admin') {
			router.push('/dashboard/admin');
		} else if (user?.role === 'agent') {
			router.push('/dashboard/agent');
		} else {
			router.push('/');
		}
	};

	return <form onSubmit={handleSubmit(onSubmit)}>{/* Form fields */}</form>;
}
```

---

## **11. Build & Deployment**

### **11.1 Build Process**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run typecheck    # Check TypeScript types
```

### **11.2 Build Configuration**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true
	},
	images: {
		domains: ['images.unsplash.com', 'via.placeholder.com']
	},
	typescript: {
		ignoreBuildErrors: false
	},
	eslint: {
		ignoreDuringBuilds: false
	}
};

module.exports = nextConfig;
```

### **11.3 Environment Variables**

```bash
# .env.local (for development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=FUPRE Housing Platform

# .env.production (for production)
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=FUPRE Housing Platform
```

### **11.4 Deployment Options**

#### **Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

#### **Netlify**

```bash
# Build command
npm run build

# Publish directory
out

# Environment variables
NEXT_PUBLIC_APP_URL=https://your-app.netlify.app
```

#### **GitHub Pages**

```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json
"scripts": {
  "deploy": "gh-pages -d out"
}

# Deploy
npm run build
npm run deploy
```

---

## **12. Troubleshooting**

### **12.1 Common Issues**

#### **Hydration Errors**

```typescript
// Problem: Server and client HTML don't match
// Solution: Use ClientOnly wrapper
import { ClientOnly } from '@/components/providers/ClientOnly';

function MyComponent() {
	return (
		<ClientOnly>
			<ComponentThatUsesBrowserAPIs />
		</ClientOnly>
	);
}
```

#### **TypeScript Errors**

```typescript
// Problem: Type errors in components
// Solution: Check type definitions
interface Props {
	listing: Listing; // Make sure Listing type is imported
	onSave?: (id: string) => void;
}

function ListingCard({ listing, onSave }: Props) {
	// Component implementation
}
```

#### **Build Failures**

```bash
# Problem: Build fails with errors
# Solution: Check for common issues

# 1. TypeScript errors
npm run typecheck

# 2. ESLint errors
npm run lint

# 3. Missing dependencies
npm install

# 4. Clear cache
rm -rf .next
npm run build
```

### **12.2 Performance Optimization**

```typescript
// Lazy loading components
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
	return (
		<Suspense fallback={<Loading />}>
			<HeavyComponent />
		</Suspense>
	);
}

// Image optimization
import Image from 'next/image';

function OptimizedImage({ src, alt }) {
	return (
		<Image
			src={src}
			alt={alt}
			width={500}
			height={300}
			placeholder='blur'
			blurDataURL='data:image/jpeg;base64,...'
		/>
	);
}
```

### **12.3 Debugging Tips**

```typescript
// Console logging
console.log('Debug info:', { user, listings });

// React DevTools
// Install browser extension for component inspection

// Zustand DevTools
import { devtools } from 'zustand/middleware';

const useStore = create<State>()(
	devtools(
		(set) => ({
			// Store implementation
		}),
		{ name: 'store-name' }
	)
);
```

---

## **🎯 Summary**

This FUPRE Housing Platform is a **comprehensive, production-ready** web application built with modern technologies:

### **Key Technologies:**

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Zustand** - State management
- **React Hook Form + Zod** - Form handling and validation
- **Framer Motion** - Animations
- **Radix UI** - Accessible components

### **Core Features:**

- 🏠 **Property Listings** - Browse, search, and filter
- 👥 **Roommate Matching** - Find compatible roommates
- 💰 **Payment System** - Unlock property locations
- 📊 **Agent Dashboard** - Manage listings and earnings
- 👤 **User Profiles** - Personal information management
- 🌙 **Dark/Light Mode** - User preference theming

### **Best Practices:**

- **Mobile-first** responsive design
- **Type-safe** development
- **Accessible** components
- **Performance** optimized
- **SEO-friendly** structure
- **Production-ready** build system

This documentation should give you a complete understanding of how the project works, why each technology was chosen, and how to maintain and extend it. The codebase follows modern React and Next.js best practices, making it easy to understand and modify for future development.

---

## **📝 Quick Reference**

### **Common Commands**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format code
npm run typecheck    # Check TypeScript
```

### **Key File Locations**

- **Pages:** `src/app/`
- **Components:** `src/components/`
- **Stores:** `src/lib/store/`
- **Types:** `src/types/`
- **Utils:** `src/lib/utils/`

### **Important URLs**

- **Development:** http://localhost:3000
- **GitHub:** https://github.com/Nixhazel/fupre-housing-platform
- **Documentation:** This file (COMPLETE_DOCUMENTATION.md)

---

_Last updated: December 2024_
_Version: 1.0.0_
