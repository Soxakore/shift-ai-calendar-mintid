# MinTid Calendar - Professional Shift Scheduling System

**MinTid Calendar** is a production-ready shift scheduling and employee management system built with modern web technologies. Designed for businesses that need reliable employee scheduling, time tracking, and workforce management.

## 🌟 Key Features

### 👥 **Multi-Role Management**
- **Super Admin**: Complete system oversight and organization management
- **Admin**: Department-level scheduling and employee management  
- **Employee**: Personal schedule viewing and time tracking

### 📅 **Advanced Scheduling**
- Drag-and-drop shift creation and management
- Automated conflict detection and resolution
- Recurring shift patterns and templates
- Real-time schedule synchronization

### 📊 **Analytics & Reporting**
- Work hours tracking and visualization
- Employee performance metrics
- Scheduling efficiency reports
- Custom dashboard insights

### 🔐 **Enterprise Security**
- Role-based access control (RBAC)
- Secure authentication with Supabase Auth
- Data encryption and privacy compliance
- Audit trails for all system changes

## 🏗️ Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **UI Framework**: shadcn/ui + Radix UI primitives
- **Charts**: Recharts for data visualization
- **Build System**: Vite with optimized production builds
- **Deployment**: Netlify with automated CI/CD

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0+ and npm
- Supabase account (free tier supported)

### Installation

```bash
# Clone and setup
git clone <repository-url>
cd shift-ai-calendar-mintid
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Architecture

```
shift-ai-calendar-mintid/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Application routes and pages
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configurations
│   ├── types/          # TypeScript definitions
│   └── styles/         # Global styles and themes
├── docs/               # Comprehensive documentation
│   ├── development/    # Development guides
│   ├── deployment/     # Production deployment
│   └── fixes/          # Technical fix documentation
├── public/             # Static assets
└── supabase/          # Database schema and functions
```

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Project Overview](./docs/PROJECT_SUMMARY.md)** - Complete project documentation
- **[Development Guide](./docs/development/DEVELOPMENT_GUIDE.md)** - Setup and development workflow
- **[Deployment Guide](./docs/deployment/DEPLOYMENT_GUIDE.md)** - Production deployment procedures
- **[Fix Documentation](./docs/fixes/README.md)** - Technical issue resolutions

## 🔑 Default Test Accounts

For development and testing purposes:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Super Admin | `super_admin@mintid.temp` | `super123` | Full system access |
| Admin | `admin@mintid.temp` | `admin123` | Organization management |
| Employee | `john_employee@mintid.temp` | `john123` | Personal dashboard |

## 🌐 Production Status

✅ **Fully Deployed and Operational**
- Live production environment on Netlify
- Supabase backend with optimized performance
- All user roles and features tested and verified
- Comprehensive error handling and monitoring

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript compilation check

### Key Components Fixed
- **Employee Dashboard**: Route loading issues resolved
- **Authentication**: Role-based access working correctly
- **Data Fetching**: Optimized Supabase integration
- **UI Components**: All components properly exported and working

## 🤝 Contributing

We welcome contributions! Please see our development documentation for guidelines on:
- Code standards and conventions
- Testing requirements
- Pull request process
- Issue reporting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**MinTid Calendar** - Professional workforce management made simple.
