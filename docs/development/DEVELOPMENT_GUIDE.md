# Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account and project
- Netlify account (for deployment)

### Local Development Setup

1. **Clone and Install**
   ```bash
   git clone [repository-url]
   cd shift-ai-calendar-mintid
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your values:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   VITE_SUPER_ADMIN_GITHUB_USERNAME=your_github_username
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

### Database Setup

1. **Create Supabase Project**
   - Go to supabase.com
   - Create new project
   - Save URL and API keys

2. **Run Database Migrations**
   ```sql
   -- Run the schema files in supabase/migrations/
   -- Or use the Supabase dashboard SQL editor
   ```

3. **Set Up RLS Policies**
   ```sql
   -- Enable RLS on all tables
   -- Apply the policies from docs/database/
   ```

## Project Structure

```
shift-ai-calendar-mintid/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── integrations/       # Supabase integration
│   └── styles/             # Global styles
├── supabase/
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── public/                 # Static assets
```

## Development Workflow

### 1. Feature Development
- Create feature branch from main
- Implement feature with tests
- Update documentation
- Submit pull request

### 2. Testing
```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when implemented)
npm run test
```

### 3. Database Changes
- Create migration file in `supabase/migrations/`
- Test locally first
- Apply to staging environment
- Update type definitions

### 4. Component Development
- Use TypeScript for all components
- Follow shadcn/ui component patterns
- Implement responsive design
- Add proper error handling

## Code Standards

### TypeScript
- Strict mode enabled
- Proper type definitions for all functions
- Use interfaces for object types
- Avoid `any` type

### React
- Functional components with hooks
- Proper dependency arrays in useEffect
- Error boundaries for error handling
- Lazy loading for performance

### Styling
- Tailwind CSS for all styling
- Use design system tokens
- Mobile-first responsive design
- Dark mode support

### Database
- Use TypeScript types from Supabase
- Implement RLS policies for all tables
- Use transactions for complex operations
- Optimize queries with proper indexing

## Common Development Tasks

### Adding a New User Role
1. Update database schema
2. Add RLS policies
3. Update TypeScript types
4. Create dashboard component
5. Update routing logic
6. Add authentication handling

### Creating a New Component
1. Create component file in appropriate directory
2. Export from index.ts
3. Add TypeScript interfaces
4. Implement responsive design
5. Add to Storybook (if applicable)

### Adding Database Table
1. Create migration file
2. Add RLS policies
3. Update TypeScript types
4. Create hooks for data access
5. Test with different user roles

## Debugging

### Common Issues
1. **Route Loading Errors**: Check component imports and hook usage
2. **Database Access Errors**: Verify RLS policies and user permissions
3. **Authentication Issues**: Check environment variables and OAuth setup
4. **Build Errors**: Verify all imports and TypeScript types

### Debugging Tools
- Browser Developer Tools
- Supabase Dashboard
- React Developer Tools
- Network tab for API calls

### Logging
```typescript
// Use console.log for development
console.log('Debug info:', data);

// Use proper error handling in production
try {
  // risky operation
} catch (error) {
  console.error('Error:', error);
  // handle error appropriately
}
```

## Performance Optimization

### Code Splitting
```typescript
// Lazy load components
const ComponentName = lazy(() => import('./ComponentName'));
```

### Database Optimization
- Use proper indexes
- Limit query results
- Use pagination for large datasets
- Cache frequently accessed data

### Bundle Optimization
- Analyze bundle size with `npm run build:analyze`
- Remove unused dependencies
- Use tree shaking
- Optimize images and assets

## Deployment

### Staging
1. Push to staging branch
2. Automatic deployment to staging URL
3. Run integration tests
4. Verify functionality

### Production
1. Merge to main branch
2. Automatic deployment to production
3. Monitor for errors
4. Verify all features working

## Security Considerations

### Authentication
- Use secure password policies
- Implement proper session management
- Validate all user inputs
- Use HTTPS for all communications

### Database Security
- Implement comprehensive RLS policies
- Use parameterized queries
- Validate all database inputs
- Regular security audits

### Frontend Security
- Sanitize all user inputs
- Use Content Security Policy
- Implement proper error handling
- Avoid exposing sensitive data

## Troubleshooting

### Development Issues
1. Clear node_modules and reinstall
2. Check environment variables
3. Verify database connection
4. Check browser console for errors

### Production Issues
1. Check deployment logs
2. Verify environment variables
3. Check database connectivity
4. Monitor error tracking service

## Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com)

### Tools
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Netlify Dashboard](https://app.netlify.com)
- [VS Code Extensions](recommended-extensions.md)

## Support

For development questions or issues:
1. Check this documentation
2. Search existing issues
3. Create new issue with reproduction steps
4. Contact development team
