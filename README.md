# LVL UP Performance

A next-generation HR performance management and feedback system designed as a SaaS platform. LVL UP Performance creates living, breathing performance ecosystems where every employee becomes a feedback node through our innovative Universal Feedback Link System.

## 🚀 Features

### Universal Feedback Link System
- **Personalized URLs**: Every employee gets a unique feedback collection link
- **QR Code Integration**: Generate QR codes for easy feedback sharing
- **Multiple Integration Methods**: Seamless feedback collection across platforms
- **Real-time Processing**: Instant feedback aggregation and analysis

### Advanced Goal Management
- **Multi-step Goal Creation**: Priority levels, difficulty ratings, and milestone tracking
- **Smart Filtering & Search**: Real-time search with advanced filtering options
- **Visual Progress Tracking**: Beautiful goal cards with progress visualization
- **Analytics Dashboard**: Dynamic metrics and completion rate monitoring

### Multi-Tenant Architecture
- **Subscription Tiers**: 6 different plans (MJ Scott, Forming, Storming, Norming, Performing, AppSumo)
- **Role-based Access Control**: Platform admins, tenant admins, managers, and employees
- **Data Isolation**: Complete tenant separation at the database level
- **Scalable Infrastructure**: Built for enterprise-grade performance

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for lightning-fast development
- **shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for responsive design
- **TanStack Query** for efficient state management
- **wouter** for lightweight routing

### Backend
- **Express.js** with TypeScript (ES modules)
- **PostgreSQL** with Drizzle ORM
- **Replit Auth** (OpenID Connect) for authentication
- **Passport.js** for session management
- **Multi-tenant data architecture**

### Infrastructure
- **Neon Database** (Serverless PostgreSQL)
- **Replit Deployment** with automatic scaling
- **Session storage** in PostgreSQL
- **Environment-based configuration**

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Replit Auth credentials (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lvl-up-performance.git
   cd lvl-up-performance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   SESSION_SECRET=your_32_character_session_secret
   REPLIT_AUTH_ISSUER=https://replit.com
   REPLIT_AUTH_CLIENT_ID=your_oauth_client_id
   REPLIT_AUTH_CALLBACK_URL=your_callback_url
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:5000` to see the application running.

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # Utilities and configurations
│   │   └── App.tsx        # Main application component
├── server/                # Express backend application
│   ├── config.ts          # Environment configuration
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   ├── replitAuth.ts      # Authentication setup
│   └── index.ts           # Server entry point
├── shared/                # Shared code between client/server
│   └── schema.ts          # Database schema definitions
└── docs/                  # Documentation files
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:push --force` - Force push schema changes
- `npm run type-check` - Run TypeScript type checking

## 🚀 Deployment

### Replit Deployment
1. Configure all required environment variables in Replit Secrets
2. Ensure Replit Auth is properly set up
3. Push your code to the repository
4. Replit will automatically deploy your application

### Manual Deployment
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.

## 🔐 Authentication & Security

- **Replit Auth Integration**: Secure OAuth authentication
- **Session Management**: PostgreSQL-backed sessions
- **Multi-tenant Security**: Complete data isolation
- **Environment-based Configuration**: Separate dev/prod settings
- **Secure Cookies**: HTTP-only, secure flags in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete deployment and setup instructions
- [GitHub Setup](./GITHUB_SETUP.md) - How to push this project to GitHub
- [Project Architecture](./replit.md) - Detailed technical architecture

## 🐛 Known Issues

- Browserslist data is outdated (run `npx update-browserslist-db@latest`)
- PostCSS plugin warnings in development (does not affect functionality)

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Check the [Deployment Guide](./DEPLOYMENT_GUIDE.md) for common issues
- Review the troubleshooting section in documentation
- Create an issue for bugs or feature requests

---

**Built with ❤️ for modern HR teams** | **Version 1.0.0** | **Last Updated: September 2025**