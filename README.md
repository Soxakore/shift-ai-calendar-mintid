# MinTid - Smart Work Schedule Calendar

A modern, responsive work schedule management application built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

- **Responsive Design**: Mobile-first approach with full desktop support
- **Role-Based Access**: Employee, Manager, Org Admin, and Super Admin roles
- **Schedule Management**: Interactive calendar for shift planning
- **Task Management**: Create, assign, and track work tasks
- **Reports & Analytics**: Work hour tracking and performance metrics
- **Modern UI**: Clean, professional interface with dark/light mode support
- **Multi-language Support**: Internationalization ready

## 🚀 Quick Start

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mintid-shift-scheduler
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🌐 Deployment

### Netlify Deployment

This project is optimized for Netlify deployment:

1. **Automatic Deployment**: Connect your GitHub repository to Netlify
2. **Build Settings**: 
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment**: Node.js 18+

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Upload the `dist` folder to your hosting provider

### Netlify Configuration

The project includes:
- `netlify.toml` - Netlify configuration file
- `public/_redirects` - SPA routing support
- Optimized headers for security and caching

## 📱 Responsive Design

MinTid is built with mobile-first responsive design:

- **Mobile (< 640px)**: Hamburger menu, stacked layouts, touch-optimized buttons
- **Tablet (640px - 1024px)**: Adaptive grid layouts, compact navigation
- **Desktop (> 1024px)**: Full feature layout, expanded navigation

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Routing**: React Router DOM
- **State Management**: React hooks
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

**MinTid** - Making work schedule management simple and efficient.
