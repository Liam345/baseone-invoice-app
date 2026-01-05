# Invoice App

A self-sustaining invoice management application extracted from Midday. This application provides comprehensive invoice management, customer management, PDF generation, and automated email delivery.

## Features

- 📄 **Invoice Management**: Create, edit, and track invoices with professional templates
- 👥 **Customer Management**: Comprehensive customer profiles with address management  
- 📧 **Email Delivery**: Automated invoice delivery with customizable email templates
- 📊 **Analytics**: Payment tracking, overdue monitoring, and business insights
- 🎨 **Customization**: Branded templates with logo, colors, and custom layouts
- 💾 **PDF Generation**: Professional PDF invoices with multiple template options
- 🔒 **Multi-tenant**: Team-based access control and data isolation
- 🌍 **Multi-currency**: Support for multiple currencies with automatic conversion

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: tRPC, Drizzle ORM, PostgreSQL
- **Authentication**: Supabase Auth  
- **Storage**: Supabase Storage
- **Email**: Resend
- **Jobs**: Trigger.dev
- **Monorepo**: Turbo, Biome

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <repository>
   cd invoice-app
   bun install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Run database migrations:**
   ```bash
   bun db:migrate
   ```

4. **Start development server:**
   ```bash
   bun dev
   ```

5. **Visit**: `http://localhost:3000`

## Project Structure

```
invoice-app/
├── packages/
│   ├── db/           # Database schema, queries, migrations
│   ├── api/          # tRPC API routes and schemas
│   ├── ui/           # Shared UI components  
│   ├── email/        # Email templates and sending
│   ├── invoice/      # Invoice-specific utilities
│   └── jobs/         # Background job processing
├── apps/
│   ├── web/          # Main web application
│   └── api/          # API server
└── docs/             # Documentation
```

## Environment Variables

See `.env.example` for required environment variables.

## License

MIT License - see [LICENSE](LICENSE) for details.