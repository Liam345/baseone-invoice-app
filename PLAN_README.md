# Invoice App Development Plan

This document outlines the complete development plan for extracting a self-sustaining invoice app from Midday. The project is being built step-by-step, with each step requiring review and commit before proceeding.

## Project Overview

Extract Midday's comprehensive invoicing system to create a standalone application with:
- 📄 Complete invoice management (create, edit, track, PDF generation)
- 👥 Customer management with financial tracking
- 📧 Automated email delivery and reminders  
- 🎨 Customizable templates and branding
- 💰 Multi-currency support with analytics
- 🔒 Multi-tenant team-based access control

## Current Status: ✅ Step 5 COMPLETED

**Invoice Creation & Editing** - Complete invoice management interface with advanced forms, line items, calculations, and drag-and-drop functionality is ready.

---

## Development Steps

### ✅ Step 1: Foundation Setup (COMPLETED)
- [x] Set up monorepo architecture with Turbo, Biome, TypeScript
- [x] Extract and adapt database schema (invoices, customers, teams, users, templates, products, tags)
- [x] Implement database queries with proper TypeScript typing
- [x] Create JWT token system for invoice security
- [x] Set up environment configuration

**Files Created:**
- Project structure with `packages/` and `apps/` folders
- `packages/db/` - Complete database layer
- `packages/invoice/` - Invoice utilities and token system
- Configuration files (turbo.json, biome.json, tsconfig.json, .env.example)

---

### ✅ Step 2: Next.js Application & Authentication (COMPLETED)
**Objective:** Set up the main web application with authentication

**Tasks:**
- [x] Create Next.js 15 app with App Router in `apps/web/`
- [x] Set up Supabase authentication integration
- [x] Implement user registration/login flows
- [x] Create protected route middleware
- [x] Create basic dashboard layout with navigation
- [ ] Set up team selection and switching (deferred to Step 3)
- [ ] Implement user profile management (deferred to Step 3)

**Files Created:**
- `apps/web/package.json` - Next.js app with all dependencies
- `apps/web/src/app/layout.tsx` - Root layout
- `apps/web/src/app/auth/signin/page.tsx` - Sign in page
- `apps/web/src/app/auth/signup/page.tsx` - Sign up page
- `apps/web/src/app/dashboard/` - Complete dashboard structure
- `apps/web/src/middleware.ts` - Route protection
- `apps/web/src/lib/supabase/` - Supabase client setup
- `apps/web/src/lib/auth.ts` - Auth utilities
- `apps/web/src/components/ui/` - shadcn/ui components
- `apps/web/src/components/layout/` - Dashboard layout components

**Features Implemented:**
- User authentication with Supabase (sign in, sign up, sign out)
- Protected dashboard routes with middleware
- Responsive dashboard layout with sidebar navigation
- Basic dashboard overview with stats placeholders
- Placeholder pages for invoices, customers, analytics, settings

---

### ✅ Step 3: tRPC API Infrastructure (COMPLETED)
**Objective:** Create type-safe API layer for frontend-backend communication

**Tasks:**
- [x] Set up tRPC server in `packages/api/`
- [x] Create invoice router with CRUD operations
- [x] Create customer router with management endpoints
- [x] Create team and user routers
- [x] Implement authentication middleware
- [x] Set up validation schemas with Zod
- [x] Create tRPC client for Next.js app
- [x] Add error handling and logging

**Files Created:**
- `packages/api/` - Complete tRPC server package
- `packages/api/src/routers/` - Invoice, customer, team, user routers
- `packages/api/src/schemas/` - Comprehensive Zod validation schemas
- `packages/api/src/middleware/` - Authentication and authorization middleware
- `packages/api/src/lib/` - Error handling and logging utilities
- `apps/web/src/lib/trpc/` - tRPC client setup with React Query
- `apps/web/src/app/api/trpc/` - Next.js API route handler

**Features Implemented:**
- Type-safe API endpoints for all major operations
- Multi-level authentication (public, protected, team, admin)
- Comprehensive error handling with structured logging
- Input validation with detailed error messages
- JWT token support for public invoice sharing
- React Query integration for client-side data fetching

---

### ✅ Step 4: Customer Management System (COMPLETED)
**Objective:** Complete customer management functionality

**Tasks:**
- [x] Create customer list page with search and filtering
- [x] Implement customer creation/editing forms
- [x] Add customer details page with invoice history
- [x] Create tag management system
- [ ] Implement address autocomplete (Google Maps) - Deferred to future enhancement
- [ ] Add customer import/export functionality - Deferred to future enhancement
- [x] Create customer analytics and insights

**Files Created:**
- `apps/web/src/components/customers/customer-table.tsx` - Complete customer data table with search, filtering, and actions
- `apps/web/src/components/customers/customer-form.tsx` - Comprehensive customer creation and editing form
- `apps/web/src/app/dashboard/customers/page.tsx` - Main customers list page
- `apps/web/src/app/dashboard/customers/new/page.tsx` - New customer creation page
- `apps/web/src/app/dashboard/customers/[id]/page.tsx` - Customer details with analytics and invoice history
- `apps/web/src/app/dashboard/customers/[id]/edit/page.tsx` - Customer editing page
- `apps/web/src/components/ui/` - Additional UI components (Badge, Skeleton, Form, Card, Separator, Textarea)

**Features Implemented:**
- Advanced search and filtering by name, email, company, and tags
- Complete CRUD operations for customers with validation
- Tag management system with color coding and bulk operations
- Customer analytics dashboard with payment insights
- Invoice history integration with status tracking
- Responsive design with loading states and error handling
- Form validation with comprehensive field support
- Multi-currency support and address management

---

### ✅ Step 5: Invoice Creation & Editing (COMPLETED)
**Objective:** Implement complete invoice management interface

**Tasks:**
- [x] Create invoice list page with advanced filtering
- [x] Implement invoice creation form with line items
- [x] Add drag-and-drop line item reordering
- [x] Create product autocomplete system
- [x] Implement real-time calculations (tax, VAT, totals)
- [x] Add invoice templates and customization
- [x] Create invoice preview and editing interface
- [ ] Implement draft auto-save functionality - Deferred to future enhancement

**Files Created:**
- `apps/web/src/components/invoices/invoice-table.tsx` - Advanced invoice list with filtering, search, and actions
- `apps/web/src/components/invoices/invoice-form.tsx` - Comprehensive invoice creation and editing form
- `apps/web/src/components/invoices/line-items-editor.tsx` - Drag-and-drop line items editor
- `apps/web/src/components/invoices/product-autocomplete.tsx` - Product selection with search and categories
- `apps/web/src/app/dashboard/invoices/page.tsx` - Main invoices list page
- `apps/web/src/app/dashboard/invoices/new/page.tsx` - New invoice creation page
- `apps/web/src/app/dashboard/invoices/[id]/page.tsx` - Invoice details and preview page
- `apps/web/src/app/dashboard/invoices/[id]/edit/page.tsx` - Invoice editing page
- `apps/web/src/components/ui/` - Additional UI components (Command, Popover)

**Features Implemented:**
- Advanced invoice filtering by status, date range, customer, and search
- Comprehensive invoice form with customer selection and currency support
- Dynamic line items with drag-and-drop reordering capability
- Product autocomplete with categories and pricing suggestions
- Real-time tax and total calculations with multi-currency support
- Invoice preview with professional layout and customer details
- Status management (draft, unpaid, paid, overdue, canceled)
- Public link sharing and email sending capabilities
- Template customization with company branding options

---

### ✅ Step 6: PDF Generation & Templates (COMPLETED)
**Objective:** Professional PDF generation with customizable templates

**Tasks:**
- [x] Set up React-PDF for invoice generation ✅
- [x] Create customizable invoice templates (Modern, Classic, Minimal) ✅
- [x] Implement logo and branding options ✅
- [ ] Add multi-language support for templates (Pending - Low priority)
- [ ] Create PDF preview functionality (Pending - Next step)
- [ ] Implement template management interface (Pending)
- [ ] Add QR code generation for payments (Pending - Low priority)

**Key Files Created:**
- `packages/pdf/` - Complete PDF generation package ✅
- `packages/pdf/src/templates/` - Modern, Classic, Minimal templates ✅
- `packages/pdf/src/generators/pdf-generator.tsx` - Core PDF generation ✅
- `packages/api/src/routers/pdf.ts` - PDF API endpoints ✅
- `apps/web/src/components/invoices/invoice-pdf-download.tsx` - Download UI ✅
- `apps/web/src/components/settings/branding-settings.tsx` - Branding configuration ✅

**Features Implemented:**
- Professional PDF generation with @react-pdf/renderer
- Three customizable templates: Modern, Classic, and Minimal
- Template selection with preview and customization options
- Company logo upload and branding integration
- Color scheme customization (primary, secondary, accent colors)
- Font family selection (Inter, Times, Helvetica)
- Template-aware invoice generation with team branding
- Download interface integrated into invoice table
- Real-time PDF generation with progress indicators

---

### 🔄 Step 7: Email System (PENDING)
**Objective:** Automated email delivery and communication

**Tasks:**
- [ ] Set up email package with Resend integration
- [ ] Create email templates (invoice, overdue, reminder, receipt)
- [ ] Implement automated invoice sending
- [ ] Add email tracking and delivery status
- [ ] Create reminder scheduling system
- [ ] Implement bulk email operations

**Key Files to Extract/Adapt:**
- `packages/email/` - Email templates and sending
- Email templates from `midday/packages/email/emails/invoice*.tsx`

---

### 🔄 Step 8: Background Jobs & Processing (PENDING)
**Objective:** Async processing for heavy operations

**Tasks:**
- [ ] Set up Trigger.dev or alternative job system
- [ ] Create PDF generation jobs
- [ ] Implement email sending jobs
- [ ] Add invoice scheduling jobs
- [ ] Create data export/import jobs
- [ ] Implement job status tracking

**Key Files to Extract/Adapt:**
- `packages/jobs/` - Background job processing
- Job definitions from `midday/packages/jobs/src/tasks/invoice/`

---

### 🔄 Step 9: Analytics & Reporting (PENDING)
**Objective:** Business insights and invoice analytics

**Tasks:**
- [ ] Create invoice summary widgets
- [ ] Implement payment score calculation
- [ ] Add overdue tracking and alerts
- [ ] Create customer analytics
- [ ] Build revenue and payment trend charts
- [ ] Implement dashboard with key metrics

**Key Files to Extract/Adapt:**
- Analytics components from `midday/apps/dashboard/src/components/`
- Chart components and data visualization

---

### 🔄 Step 10: Testing & Documentation (PENDING)
**Objective:** Ensure quality and provide setup guidance

**Tasks:**
- [ ] Write unit tests for database queries
- [ ] Create integration tests for API endpoints
- [ ] Add E2E tests for critical user flows
- [ ] Write comprehensive setup documentation
- [ ] Create deployment guides
- [ ] Add API documentation
- [ ] Create user guides and tutorials

---

## File Structure Overview

```
invoice-app/
├── packages/
│   ├── db/              ✅ Database schema and queries
│   ├── api/             🔄 tRPC API routes and schemas
│   ├── ui/              🔄 Shared UI components
│   ├── email/           🔄 Email templates and sending
│   ├── invoice/         ✅ Invoice utilities (tokens)
│   ├── pdf/             🔄 PDF generation
│   └── jobs/            🔄 Background job processing
├── apps/
│   ├── web/             🔄 Main Next.js application
│   └── api/             🔄 API server (if separate)
├── docs/                🔄 Documentation
└── README.md            📄 Main project documentation
```

## Key Dependencies

### Core Framework
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **tRPC** - Type-safe APIs

### Database & Auth
- **Drizzle ORM** - Database operations
- **PostgreSQL** - Database with full-text search
- **Supabase** - Authentication and file storage

### Additional Services
- **Resend** - Email delivery
- **Trigger.dev** - Background jobs
- **React-PDF** - PDF generation

## Source Material

Original code is extracted from:
- **Midday Repository**: `/Users/liambanga/Code/business-tool/midday/`
- **Key Source Directories**:
  - `packages/db/` - Database layer
  - `apps/dashboard/src/components/` - UI components
  - `apps/api/src/` - API routes and schemas
  - `packages/email/` - Email templates
  - `packages/jobs/` - Background processing

## Development Guidelines

1. **Step-by-step approach** - Complete each step fully before moving to the next
2. **Preserve Midday patterns** - Maintain the same code structure and conventions
3. **Remove dependencies** - Eliminate connections to other Midday features
4. **Self-sustaining** - Ensure the app works independently
5. **Professional quality** - Maintain production-ready code standards

## Notes for AI Continuation

- Always read this plan first to understand current progress
- Check todo list status before proceeding
- Extract code from Midday source rather than rewriting
- Maintain TypeScript strict mode and proper error handling
- Test each step thoroughly before marking complete
- Update this plan if requirements change

## Getting Started (for AI)

1. Review current step status above
2. Check existing code structure in `/packages/` and `/apps/`
3. Read relevant source files from Midday directory
4. Implement the next pending step following the task list
5. Test implementation thoroughly
6. Update todo list and mark step complete