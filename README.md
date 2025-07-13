# 🎁 Don8 - Donation and Distribution Management Platform

> A modern, user-friendly web platform that bridges the gap between donors and recipients, facilitating the donation and distribution of essential items like food, clothing, electronics, and more.

![Don8 Platform](https://img.shields.io/badge/Status-Active-green)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.49.1-green)

## 🌟 Features

### 👥 **Multi-Role User Management**
- **Donors**: Register and list items for donation
- **Recipients**: Browse and request available donations
- **Administrators**: Comprehensive platform management

### 📦 **Donation Management**
- Create and manage donation listings
- Multiple categories: Food, Clothing, Electronics, Furniture, Books, Toys, and More
- Real-time status tracking (Pending, Received, Rejected)
- Image gallery support (up to 3 images per donation)
- Expiry time management for perishable items
- Location-based pickup coordination

### 💬 **Communication System**
- Direct messaging between donors and recipients
- Real-time message notifications
- Message read/unread status tracking
- Secure user-to-user communication

### ⏰ **Pickup Scheduling**
- Recipients can request specific pickup times
- Automated deadline management
- Time-sensitive notifications for food items
- Smart expiry detection and handling

### 🛡️ **Safety & Security**
- User reporting system for inappropriate behavior
- Admin moderation tools
- Secure authentication with email verification
- Protected user data with Row-Level Security (RLS)

### 📊 **Administrative Tools**
- Comprehensive admin dashboard
- Donation statistics and analytics
- User report management
- Platform monitoring and maintenance tools

### 📱 **User Experience**
- Responsive design for all devices
- Dark/light theme support
- Intuitive navigation
- Professional UI with smooth animations
- Accessible design principles

## 🚀 Tech Stack

### **Frontend**
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.5.3** - Type-safe development
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing

### **UI/UX**
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icon library
- **Next Themes** - Theme management

### **Backend & Database**
- **Supabase** - Complete backend solution
  - **PostgreSQL** - Robust relational database
  - **Authentication** - JWT-based auth system
  - **Storage** - Secure file uploads
  - **Real-time** - Live data synchronization
  - **Edge Functions** - Serverless functions

### **State Management**
- **TanStack React Query** - Server state management
- **React Context** - Global state management
- **React Hook Form** - Form state management

### **Data Validation**
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation integration

### **Development Tools**
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🔒 Security Features

### **Authentication & Authorization**
- JWT-based authentication system
- Email verification for new accounts
- Role-based access control (RBAC)
- Admin verification codes for administrative access
- Secure session management

### **Database Security**
- **Row-Level Security (RLS)** policies implemented
- User data isolation and protection
- Secure API endpoints
- SQL injection prevention

### **Data Protection**
- Encrypted data transmission (HTTPS)
- Secure file upload and storage
- Input validation and sanitization
- XSS and CSRF protection

### **Privacy Controls**
- User reporting and blocking system
- Data anonymization options
- Secure user-to-user communication
- GDPR-compliant data handling

## 🎯 Project Highlights

### **Real-time Features**
- Live donation status updates
- Instant messaging system
- Real-time notifications
- Dynamic content updates

### **Smart Food Management**
- Automatic expiry tracking for food items
- Time-sensitive alerts and notifications
- Smart categorization and filtering
- Pickup deadline management

### **Professional Design**
- Modern, clean interface
- Mobile-first responsive design
- Consistent design system
- Accessible UI components
- Smooth user interactions

### **Scalable Architecture**
- Modular component structure
- Type-safe development
- Efficient state management
- Optimized performance
- Maintainable codebase

## 📋 Database Schema

### **Core Tables**
- **profiles** - User profile information
- **donations** - Donation listings and details
- **messages** - Communication system
- **pickup_requests** - Scheduling system
- **user_reports** - Safety and moderation

### **Key Features**
- Foreign key relationships
- Automated triggers and functions
- Comprehensive RLS policies
- Data integrity constraints
- Optimized indexing

## 🚦 Getting Started

### **Prerequisites**
- Node.js 16+ and npm
- Supabase account and project
- Modern web browser

  
📄 Project Submission

This project was submitted to **APJ Abdul Kalam Technological University (KTU)**  
as part of the partial fulfillment for the degree of **Bachelor of Technology (B.Tech)**  
in **Computer Science and Engineering**, academic year 2025–2026.

🎓 Submitted by:
- 


### **Installation**
```bash
# Clone the repository
git clone https://github.com/your-username/don8.git

# Navigate to project directory
cd don8

# Install dependencies
npm install

# Set up envi

